import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// STATIC IMPORTS 
import LoginPage from '../views/LoginPage.vue'
import SignupPage from '../views/SignupPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import StaffInputPage from '../views/StaffInputPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/shift-input',
    name: 'StaffInput', // Fixed name string alignment to match its component target
    component: StaffInputPage,
    meta: { requiresAuth: true, role: 'staff' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

// Global Routing Interceptor Engine
router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 1. If no authenticated session block exists
  if (!user) {
    if (requiresAuth) return next('/login')
    return next()
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid))
    let userRole = 'staff' // Default local state placeholder fallback

    if (userDoc.exists()) {
      // Pull and clean role field casing
      userRole = (userDoc.data()?.role || 'staff').toLowerCase().trim()
    } else {
      console.warn(`Firestore account record profile doesn't exist yet for UID: ${user.uid}`)
    }

    // 2. Break infinite loops if user is already exactly where they need to be
    if (userRole === 'admin' && to.path === '/dashboard') return next()
    if (userRole === 'staff' && to.path === '/shift-input') return next()

    // 3. Redirect logged-in users out of authorization nodes
    if (to.path === '/login' || to.path === '/signup') {
      return next(userRole === 'admin' ? '/dashboard' : '/shift-input')
    }

    // 4. Enforce role clearance parameters
    const requiredRole = to.meta.role
    if (requiredRole && userRole !== requiredRole) {
      console.warn(`Access Denied. Role clearance mismatch. Account: ${userRole}, Required: ${requiredRole}`)
      return next(userRole === 'admin' ? '/dashboard' : '/shift-input')
    }

    next()
  } catch (error) {
    console.error("Router lifecycle execution guard intercepted a crash:", error)
    next('/login')
  }
}) 

export default router
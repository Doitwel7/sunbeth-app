import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from './firebase' // Imported db to fetch roles
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// Direct view node imports
import Login from './views/LoginPage.vue'
import Signup from './views/SignUpPage.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import Dashboard from './views/AdminDashboard.vue'
import StaffDashboard from './views/StaffDashboard.vue'
import TransactionsView from './views/TransactionsView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/signup', component: Signup, meta: { guestOnly: true } },
  { path: '/forgot-password', component: ForgotPassword, meta: { guestOnly: true } },
  
  // Admin Route Bounds
  { 
    path: '/dashboard', 
    component: Dashboard, 
    meta: { requiresAuth: true, role: 'admin' } 
  },
  
  // Fixed & Connected Staff Route Bounds
  { 
    path: '/staff-dashboard', 
    component: StaffDashboard, 
    meta: { requiresAuth: true, role: 'staff' } 
  },
  
  // Optional Transactions View Module Block
  { 
    path: '/transactions', 
    component: TransactionsView, 
    meta: { requiresAuth: true } 
  },
  
  // Global catch-all fallback protection
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Helper promise to await active network connection confirmation from Firebase Auth
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

// Global Navigation Interceptor and Routing Guard Engine
router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  // Case A: User is not authenticated but is attempting to access a secure workspace
  if (requiresAuth && !currentUser) {
    return next('/login')
  }

  // Case B: User is authenticated and checking role boundaries
  if (currentUser) {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const userRole = userData.role // Expected: 'admin' or 'staff'

        // Prevent authenticated users from visiting guest-only paths (Login/Signup)
        if (guestOnly) {
          return next(userRole === 'admin' ? '/dashboard' : '/staff-dashboard')
        }

        // Validate targeted route specific role requirements
        if (to.meta.role && to.meta.role !== userRole) {
          return next(userRole === 'admin' ? '/dashboard' : '/staff-dashboard')
        }
      } else {
        // Handle case where user auth state is valid but Firestore database profile record doesn't exist
        console.error("Firestore user profile document not detected.")
        if (requiresAuth) return next('/login')
      }
    } catch (error) {
      console.error("Routing guard evaluation crash intercept: ", error)
      if (requiresAuth) return next('/login')
    }
  }

  next()
})

export default router
<template>
  <div class="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans antialiased">
    
    <!-- ==================== SIDEBAR BRAND COMPONENT (DESKTOP) ==================== -->
    <aside class="w-64 bg-[#0a1931] text-white flex flex-col justify-between hidden lg:flex flex-shrink-0">
      <div>
        <div class="p-6 flex items-center gap-3 border-b border-slate-800">
          <div class="w-8 h-8 bg-white rounded flex flex-col justify-between p-1">
            <div class="h-1.5 w-2/3 bg-[#105533] rounded-sm self-end"></div>
            <div class="h-1.5 w-full bg-[#5cbd45] rounded-sm"></div>
            <div class="h-1.5 w-2/3 bg-[#f36f21] rounded-sm"></div>
          </div>
          <div>
            <h1 class="font-black text-xs uppercase tracking-wider text-white">Sunbeth Energies</h1>
            <span class="text-[9px] tracking-widest text-slate-400 block uppercase">Staff Terminal v2.5</span>
          </div>
        </div>

        <nav class="p-3 space-y-0.5">
          <button v-for="tab in ['Dashboard', 'Fuel Sales', 'Fuel Inventory', 'Cash & POS', 'Shifts', 'Debts / Credit', 'Customers', 'Suppliers', 'Expenses', 'Reports', 'Alerts', 'Settings']" 
            :key="tab" @click="activeTab = tab" 
            :class="activeTab === tab ? 'bg-[#f36f21] text-white font-bold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'"
            class="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all text-left">
            <span>{{ tab === 'Dashboard' ? '📊' : tab === 'Fuel Sales' ? '⛽' : tab === 'Fuel Inventory' ? '🗂️' : tab === 'Cash & POS' ? '💳' : tab === 'Shifts' ? '⏰' : tab === 'Debts / Credit' ? '📁' : tab === 'Customers' ? '👥' : tab === 'Suppliers' ? '🚚' : tab === 'Expenses' ? '📉' : tab === 'Reports' ? '📋' : tab === 'Alerts' ? '🔔' : '⚙️' }}</span>
            {{ tab }}
          </button>
        </nav>
      </div>
      <div class="p-4 bg-[#071324] text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-800">
        <span class="truncate max-w-[120px] font-mono">{{ currentUserEmail }}</span>
        <button @click="triggerLogout" class="text-rose-400 font-bold hover:text-rose-300 transition flex items-center gap-1">
          🚪 Logout
        </button>
      </div>
    </aside>

    <!-- ==================== RESPONSIVE MOBILE SLIDE DRAWER ==================== -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden" @click="isMobileMenuOpen = false"></div>
    <aside :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'" class="fixed inset-y-0 left-0 w-64 bg-[#0a1931] text-white z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden">
      <div>
        <div class="p-5 flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-white rounded flex flex-col justify-between p-1">
              <div class="h-1 bg-[#105533] w-2/3 self-end"></div>
              <div class="h-1 bg-[#5cbd45] w-full"></div>
            </div>
            <h1 class="font-black text-xs uppercase text-white">Sunbeth Staff</h1>
          </div>
          <button @click="isMobileMenuOpen = false" class="text-slate-400 text-sm p-1">✕</button>
        </div>
        <nav class="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          <button v-for="tab in ['Dashboard', 'Fuel Sales', 'Fuel Inventory', 'Cash & POS', 'Shifts', 'Debts / Credit', 'Customers', 'Suppliers', 'Expenses', 'Reports', 'Alerts', 'Settings']" 
            :key="tab" @click="activeTab = tab; isMobileMenuOpen = false" 
            :class="activeTab === tab ? 'bg-[#f36f21] text-white font-bold' : 'text-slate-400 hover:bg-slate-800'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-left">
            <span>{{ tab === 'Dashboard' ? '📊' : tab === 'Fuel Sales' ? '⛽' : tab === 'Fuel Inventory' ? '🗂️' : tab === 'Cash & POS' ? '💳' : tab === 'Shifts' ? '⏰' : tab === 'Debts / Credit' ? '📁' : tab === 'Customers' ? '👥' : tab === 'Suppliers' ? '🚚' : tab === 'Expenses' ? '📉' : tab === 'Reports' ? '📋' : tab === 'Alerts' ? '🔔' : '⚙️' }}</span>
            <span class="ml-2">{{ tab }}</span>
          </button>
        </nav>
      </div>
      <div class="p-4 bg-[#071324] text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
        <span class="truncate max-w-[120px] font-mono">{{ currentUserEmail }}</span>
        <button @click="triggerLogout" class="text-rose-400 font-bold flex items-center gap-1">🚪 Exit</button>
      </div>
    </aside>

    <!-- ==================== WORKSPACE HUB ROUTER ==================== -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      
      <!-- Responsive Header -->
      <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="p-2 -ml-2 text-slate-600 hover:text-slate-900 block lg:hidden text-lg">
            ☰
          </button>
          <h2 class="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">{{ activeTab }} Panel</h2>
        </div>
        <button @click="showRecordSaleModal = true" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#f36f21] hover:bg-[#e05d13] text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-sm transition">
          ⚡ Log Sale
        </button>
      </header>

      <div class="p-4 sm:p-8 flex-1">
        
        <!-- MENU 1: DASHBOARD VIEW PANEL -->
        <div v-if="activeTab === 'Dashboard'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Volume Liquidated</span>
              <h3 class="text-xl font-black text-[#105533] mt-1 font-mono">{{ totalLitersSold.toLocaleString() }} L</h3>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cash Flow Value</span>
              <h3 class="text-xl font-black text-[#f36f21] mt-1 font-mono">₦{{ totalRevenue.toLocaleString() }}</h3>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Active Pumps</span>
              <h3 class="text-xl font-black text-blue-600 mt-1 font-mono">06 / 06 Channels</h3>
            </div>
          </div>
          <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Realtime Flow Monitor Engine</h4>
            <div class="h-64 relative"><canvas id="cashSummaryChart"></canvas></div>
          </div>
        </div>

        <!-- MENU 2: FUEL SALES DATA MATRIX -->
        <div v-if="activeTab === 'Fuel Sales'" class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Attendant Ledger Flow Pipeline</div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-100/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th class="p-4">Product Specs</th><th class="p-4">Discharged</th><th class="p-4">Rate</th><th class="p-4">Cash Received</th><th class="p-4">POS Drop</th><th class="p-4 text-right">Engine Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium font-mono">
                <tr v-for="log in recentSales" :key="log.id" class="hover:bg-slate-50/60">
                  <template v-if="editingId !== log.id">
                    <td class="p-4 font-sans font-bold text-slate-900">
                      {{ log.fuelType }}
                      <span class="block text-[10px] text-slate-400 font-medium uppercase mt-0.5">{{ log.shiftBlock }} | By: {{ log.attendantName || 'System' }} | Date: {{ log.date || 'N/A' }}</span>
                    </td>
                    <td class="p-4 text-slate-900 font-bold">{{ log.litersSold }} L</td>
                    <td class="p-4">₦{{ log.ratePerLiter }}</td>
                    <td class="p-4 text-[#105533]">₦{{ log.cashReceived }}</td>
                    <td class="p-4 text-blue-600">₦{{ log.posReceived }}</td>
                    <td class="p-4 text-right space-x-2 whitespace-nowrap">
                      <button @click="startInlineEdit(log)" class="px-2.5 py-1.5 border border-slate-200 hover:border-[#f36f21] rounded-lg bg-white text-slate-600 transition font-sans font-bold">Edit</button>
                      <button @click="deleteLog(log.id)" class="px-2.5 py-1.5 border border-rose-100 text-rose-600 rounded-lg bg-rose-50 font-sans font-bold">Wipe</button>
                    </td>
                  </template>
                  <template v-else>
                    <td class="p-3">
                      <select v-model="editForm.fuelType" class="w-full p-2 border rounded-lg bg-white text-xs font-sans"><option v-for="t in fuelTypes" :key="t" :value="t">{{ t }}</option></select>
                      <select v-model="editForm.shiftBlock" class="w-full p-2 border rounded-lg bg-white text-xs font-sans mt-1"><option v-for="s in shiftBlocks" :key="s" :value="s">{{ s }}</option></select>
                      <input v-model="editForm.date" type="date" class="w-full p-2 border rounded-lg bg-white text-xs font-sans mt-1" />
                    </td>
                    <td class="p-3"><input v-model="editForm.litersSold" type="number" class="w-20 p-2 border rounded-lg bg-white" /></td>
                    <td class="p-3"><input v-model="editForm.ratePerLiter" type="number" class="w-20 p-2 border rounded-lg bg-white" /></td>
                    <td class="p-3"><input v-model="editForm.cashReceived" type="number" class="w-24 p-2 border text-[#105533] rounded-lg bg-white" /></td>
                    <td class="p-3"><input v-model="editForm.posReceived" type="number" class="w-24 p-2 border text-blue-600 rounded-lg bg-white" /></td>
                    <td class="p-3 text-right space-x-1 whitespace-nowrap">
                      <button @click="saveInlineEdit(log.id)" class="px-3 py-1.5 bg-[#105533] text-white rounded-lg font-sans font-bold">Save</button>
                      <button @click="editingId = null" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-sans font-bold">Cancel</button>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MENU 3: FUEL INVENTORY -->
        <div v-if="activeTab === 'Fuel Inventory'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div v-for="inv in inventoryList" :key="inv.id" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 class="font-bold text-xs text-slate-900 uppercase tracking-tight">{{ inv.fuelType }}</h4>
              <div class="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div class="h-full bg-[#105533]" :style="{ width: (inv.currentStock / inv.capacity * 100) + '%' }"></div>
              </div>
              <div class="flex justify-between items-center text-xs font-mono mt-3">
                <span class="text-slate-400">Stock Capacity:</span>
                <span class="font-bold text-slate-900">{{ inv.currentStock.toLocaleString() }} / {{ inv.capacity.toLocaleString() }} L</span>
              </div>
              <span class="text-[10px] text-slate-400 block mt-2 font-sans">Last Depot Delivery: {{ inv.lastDelivery }}</span>
            </div>
          </div>
        </div>

        <!-- MENU 4: CASH & POS -->
        <div v-if="activeTab === 'Cash & POS'" class="space-y-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">Vault Liquidity & POS Settlement</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span class="text-slate-500 font-sans block text-[10px] uppercase font-bold">Aggregated Safe Cash-In-Hand</span>
                <div class="text-xl font-bold text-[#105533] mt-1">₦{{ totalCashCollected.toLocaleString() }}</div>
              </div>
              <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <span class="text-slate-500 font-sans block text-[10px] uppercase font-bold">Aggregated POS Pending Settlement</span>
                <div class="text-xl font-bold text-blue-700 mt-1">₦{{ totalPosCollected.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Real-time Remittance Transaction History Logs</div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <th class="p-4">Timeline Date</th><th class="p-4">Attendant Account</th><th class="p-4">Product Specs</th><th class="p-4">Cash Dropped</th><th class="p-4">POS Dropped</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium font-mono">
                  <tr v-for="log in recentSales" :key="'hist-'+log.id" class="hover:bg-slate-50/40">
                    <td class="p-4 text-slate-500 font-sans">{{ log.date }}</td>
                    <td class="p-4 text-slate-900 font-sans font-bold">{{ log.attendantName || 'System User' }}</td>
                    <td class="p-4 text-slate-700 font-sans">{{ log.fuelType }}</td>
                    <td class="p-4 text-[#105533] font-bold">₦{{ (log.cashReceived || 0).toLocaleString() }}</td>
                    <td class="p-4 text-blue-600 font-bold">₦{{ (log.posReceived || 0).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MENU 5: SHIFTS -->
        <div v-if="activeTab === 'Shifts'" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Active Operational Assignment Shifts</div>
          <div class="p-6 space-y-3 text-xs">
            <div v-for="shift in shiftBlocks" :key="shift" class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <span class="font-bold text-slate-900 block">{{ shift }}</span>
                <span class="text-[10px] text-slate-400 font-medium">Standard Hours Operational Block Sequence</span>
              </div>
              <span class="px-2.5 py-1 bg-emerald-100 text-[#105533] rounded-full font-bold text-[10px] uppercase">Online</span>
            </div>
          </div>
        </div>

        <!-- MENU 6: DEBTS / CREDIT -->
        <div v-if="activeTab === 'Debts / Credit'" class="space-y-6">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Input Customer Credit / Debt Record</h4>
            <form @submit.prevent="submitDebt" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <input v-model="debtForm.name" type="text" placeholder="Customer Name Identifier" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="debtForm.ratePerLiter" type="number" step="0.01" placeholder="Price Per Litre (₦)" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="debtForm.liters" type="number" step="0.01" placeholder="Litres Volume Sold" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="debtForm.outstanding" type="number" step="0.01" placeholder="Money Owed Balance (₦)" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="debtForm.date" type="date" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <button type="submit" :disabled="debtLoading" class="sm:col-span-2 md:col-span-5 py-3 bg-[#f36f21] text-white font-black rounded-xl tracking-wider uppercase transition hover:bg-[#e05d13]">
                {{ debtLoading ? 'Saving Entry...' : 'Save Customer Debt Form' }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Outstanding Credit Ledger Matrix</div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <th class="p-4">Customer Account</th><th class="p-4">Date Logged</th><th class="p-4">Litres Supplied</th><th class="p-4">Rate Per Litre</th><th class="p-4">Total Owed</th><th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-semibold font-mono">
                  <tr v-for="debt in debtsList" :key="debt.id" class="hover:bg-slate-50/40">
                    <td class="p-4 text-slate-900 font-sans font-bold">
                      {{ debt.name }}
                      <span class="block text-[9px] text-slate-400 font-mono mt-0.5">Saved By: {{ debt.loggedBy || 'System' }}</span>
                    </td>
                    <td class="p-4 font-sans text-slate-500">{{ debt.date }}</td>
                    <td class="p-4 text-slate-800">{{ (debt.liters || 0).toLocaleString() }} L</td>
                    <td class="p-4 text-slate-600">₦{{ (debt.ratePerLiter || 0).toLocaleString() }}</td>
                    <td class="p-4 text-rose-600">₦{{ debt.outstanding.toLocaleString() }}</td>
                    <td class="p-4 text-right">
                      <button @click="deleteDebtLog(debt.id)" class="text-rose-600 font-sans hover:underline text-[11px]">Wipe</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MENU 7: CUSTOMERS -->
        <div v-if="activeTab === 'Customers'" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Account Profiling System</div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase text-[10px]"><th class="p-4">Entity Identifier</th><th class="p-4">Classification Tier</th><th class="p-4">Cumulative Volumes Liquidated</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-for="cust in customersList" :key="cust.id">
                  <td class="p-4 font-bold text-slate-900">{{ cust.name }}</td>
                  <td class="p-4"><span class="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{{ cust.tier }}</span></td>
                  <td class="p-4 font-mono font-bold text-slate-700">{{ cust.totalLitersBought.toLocaleString() }} Liters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MENU 8: SUPPLIERS -->
        <div v-if="activeTab === 'Suppliers'" class="space-y-6">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Add Downstream Supplier Manifest Profile</h4>
            <form @submit.prevent="submitSupplier" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <input v-model="supplierForm.company" type="text" placeholder="Company Profile Name" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="supplierForm.product" type="text" placeholder="Licensed Product Allocation (PMS/AGO/DPK)" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="supplierForm.litersDropped" type="number" step="0.01" placeholder="Total Liters Delivered" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="supplierForm.price" type="number" step="0.01" placeholder="Contract Cost Price (₦)" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="supplierForm.depot" type="text" placeholder="Loading Source Depot Node" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <input v-model="supplierForm.date" type="date" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <button type="submit" :disabled="supplierLoading" class="sm:col-span-2 md:col-span-3 py-3 bg-[#105533] text-white font-black rounded-xl tracking-wider uppercase transition hover:bg-emerald-900">
                {{ supplierLoading ? 'Registering Delivery Manifest...' : 'Commit Supplier Form Entry' }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Consolidated Distribution Partner Manifest</div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th class="p-4">Company Profile</th><th class="p-4">Allocation Range</th><th class="p-4">Manifest Date</th><th class="p-4">Source Depot</th><th class="p-4">Volume Dropped</th><th class="p-4">Price Value</th><th class="p-4">Accumulated Total Volume</th><th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium font-mono">
                  <tr v-for="sup in suppliersList" :key="sup.id">
                    <td class="p-4 font-sans font-bold text-slate-900">
                      {{ sup.company }}
                      <span class="block text-[9px] text-slate-400 font-mono mt-0.5">User: {{ sup.loggedBy || 'System' }}</span>
                    </td>
                    <td class="p-4 font-sans text-xs text-slate-600">{{ sup.product }}</td>
                    <td class="p-4 font-sans text-slate-500">{{ sup.date }}</td>
                    <td class="p-4 font-sans text-slate-500">{{ sup.depot }}</td>
                    <td class="p-4 font-bold text-slate-800">{{ (sup.litersDropped || 0).toLocaleString() }} L</td>
                    <td class="p-4 text-[#105533]">₦{{ (sup.price || 0).toLocaleString() }}</td>
                    <td class="p-4 text-blue-600 font-black">{{ (sup.accumulatedLitres || 0).toLocaleString() }} L</td>
                    <td class="p-4 text-right">
                      <button @click="deleteSupplierLog(sup.id)" class="text-rose-600 font-sans hover:underline text-[11px]">Wipe</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MENU 9: EXPENSES -->
        <div v-if="activeTab === 'Expenses'" class="space-y-6">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Input Daily Operational Expenses Details</h4>
            <form @submit.prevent="submitExpense" class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <input v-model="expenseForm.description" type="text" placeholder="Expense Particulars / Daily Description Input" required class="md:col-span-2 p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <select v-model="expenseForm.category" class="p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-bold">
                <option value="Operations">Operations</option>
                <option value="Utilities">Utilities</option>
                <option value="Logistics">Logistics</option>
                <option value="Maintenance">Station Maintenance</option>
              </select>
              <input v-model="expenseForm.amount" type="number" step="0.01" placeholder="Value Debited (₦)" required class="p-3 border border-slate-200 rounded-xl bg-slate-50" />
              <button type="submit" :disabled="expenseLoading" class="md:col-span-4 py-3 bg-[#f36f21] text-white font-black rounded-xl tracking-wider uppercase transition hover:bg-[#e05d13]">
                {{ expenseLoading ? 'Processing Debit Entry...' : 'Save Daily Expense Record' }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">Daily Operating Costs Disbursement Ledger</div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase text-[10px]"><th class="p-4">Daily Expense Description</th><th class="p-4">Ledger Cost Category</th><th class="p-4">Value Debited</th><th class="p-4">Timeline Index</th><th class="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium font-mono">
                  <tr v-for="exp in expensesList" :key="exp.id">
                    <td class="p-4 font-sans text-slate-900 font-bold">
                      {{ exp.description }}
                      <span class="block text-[9px] text-slate-400 font-mono font-normal mt-0.5">Logged By: {{ exp.loggedBy || 'System' }}</span>
                    </td>
                    <td class="p-4 font-sans"><span class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">{{ exp.category }}</span></td>
                    <td class="p-4 text-rose-600 font-bold">₦{{ exp.amount.toLocaleString() }}</td>
                    <td class="p-4 font-sans text-slate-400">{{ exp.date }}</td>
                    <td class="p-4 text-right">
                      <button @click="deleteExpenseLog(exp.id)" class="text-rose-600 font-sans hover:underline text-[11px]">Wipe</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MENU 10: REPORTS -->
        <div v-if="activeTab === 'Reports'" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">Automated Audit Summary Engine</h4>
          <p class="text-xs text-slate-400 font-medium leading-relaxed">Compile operational sheets variance reports, volumetric stock summaries, and transaction records directly from the live station ledger cluster.</p>
          <div class="flex flex-wrap gap-2 pt-2">
            <button class="px-4 py-2 bg-[#105533] text-white text-xs font-bold rounded-xl shadow-sm">Excel Shift Output (.xlsx)</button>
            <button class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm">PDF Audit Statement (.pdf)</button>
          </div>
        </div>

        <!-- MENU 11: ALERTS -->
        <div v-if="activeTab === 'Alerts'" class="space-y-3">
          <div v-for="alt in alertsList" :key="alt.id" :class="alt.type === 'critical' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'" class="p-4 rounded-xl border flex gap-4 items-start text-xs shadow-sm">
            <span class="text-lg">{{ alt.type === 'critical' ? '🚨' : '⚠️' }}</span>
            <div>
              <h5 class="font-black text-slate-900 uppercase tracking-wide text-[11px]">{{ alt.title }}</h5>
              <p class="text-slate-600 font-medium mt-0.5 leading-relaxed">{{ alt.body }}</p>
            </div>
          </div>
        </div>

        <!-- MENU 12: SETTINGS -->
        <div v-if="activeTab === 'Settings'" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div>
            <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">Terminal Infrastructure Configuration</h4>
            <p class="text-slate-400 mt-0.5 font-medium">Verify terminal identification details and connection telemetry parameters.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div class="flex flex-col space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Station Node Handle</label>
              <input type="text" disabled value="Sunbeth Node Terminal 01" class="p-3 border rounded-xl bg-slate-50 font-bold text-slate-700" />
            </div>
            <div class="flex flex-col space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Database Interceptor Cluster Status</label>
              <div class="p-3 border rounded-xl bg-emerald-50/20 text-emerald-700 font-bold flex items-center gap-2">🟢 Firebase Cloud Production Cluster Synchronized</div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- ==================== TRANSACTION RECORD POPUP MODAL ==================== -->
    <div v-if="showRecordSaleModal" class="fixed inset-0 bg-[#071324]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-100 animate-fadeIn">
        <div class="p-5 bg-[#105533] text-white flex justify-between items-center">
          <div>
            <h3 class="font-black text-xs uppercase tracking-wider text-white">Log Sunbeth Station Sale</h3>
            <p class="text-[10px] text-emerald-200/80 font-medium">Pipeline Database Write Interface</p>
          </div>
          <button @click="showRecordSaleModal = false" class="text-white hover:text-slate-200 font-bold">✕</button>
        </div>

        <form @submit.prevent="submitSale" class="p-5 space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-slate-400 text-[10px]">Product Range Product</label>
              <select v-model="form.fuelType" class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800">
                <option v-for="t in fuelTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-slate-400 text-[10px]">Shift Block</label>
              <select v-model="form.shiftBlock" class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800">
                <option v-for="s in shiftBlocks" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-slate-400 text-[10px]">Litres Discharged Volume</label>
              <input v-model="form.litersSold" type="number" step="0.01" placeholder="0.00" required class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" />
            </div>
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-slate-400 text-[10px]">Logging Date Input</label>
              <input v-model="form.date" type="date" required class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-700" />
            </div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="font-black uppercase tracking-wider text-slate-400 text-[10px]">Pump Rate (₦ per Litre)</label>
            <input v-model="form.ratePerLiter" type="number" placeholder="₦0.00" required class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-200">
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-[#105533] text-[10px]">Cash Received</label>
              <input v-model="form.cashReceived" type="number" placeholder="₦0.00" class="w-full p-3 border border-emerald-200 rounded-xl bg-emerald-50/20 text-sm" />
            </div>
            <div class="flex flex-col space-y-1">
              <label class="font-black uppercase tracking-wider text-blue-600 text-[10px]">POS Drop Remittance</label>
              <input v-model="form.posReceived" type="number" placeholder="₦0.00" class="w-full p-3 border border-blue-200 rounded-xl bg-blue-50/20 text-sm" />
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" @click="showRecordSaleModal = false" class="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" :disabled="loading" class="flex-1 py-3 bg-[#f36f21] hover:bg-[#e05d13] text-white font-black rounded-xl shadow transition-all">
              {{ loading ? 'Saving Entry...' : 'Commit Transaction' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { auth, db } from '../firebase'
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore'

// --- Navigation Active Tab & Mobile UI Controls ---
const activeTab = ref('Dashboard')
const isMobileMenuOpen = ref(false)
const loading = ref(false)
const debtLoading = ref(false)
const supplierLoading = ref(false)
const expenseLoading = ref(false)
const showRecordSaleModal = ref(false)
const editingId = ref(null)
let salesChartInstance = null

// --- Core Dropdown Datasets ---
const fuelTypes = [
  'Premium Motor Spirit (PMS - Petrol)', 
  'Automotive Gas Oil (AGO - Diesel)', 
  'Dual Purpose Kerosene (DPK - Kerosene)'
]
const shiftBlocks = ['Morning Shift', 'Evening Shift', 'Night Shift']

// --- Business Entities Reactive State Array Store ---
const recentSales = ref([])
const debtsList = ref([])
const suppliersList = ref([])
const expensesList = ref([])

const inventoryList = ref([
  { id: 1, fuelType: 'Premium Motor Spirit (PMS)', capacity: 45000, currentStock: 18650, lastDelivery: '2026-06-22' },
  { id: 2, fuelType: 'Automotive Gas Oil (AGO - Diesel)', capacity: 35000, currentStock: 12400, lastDelivery: '2026-06-24' },
  { id: 3, fuelType: 'Dual Purpose Kerosene (DPK)', capacity: 20000, currentStock: 5200, lastDelivery: '2026-06-19' }
])
const customersList = ref([
  { id: 1, name: 'Alhaji Musa Transport', tier: 'Corporate Gold', totalLitersBought: 4520 },
  { id: 2, name: 'Sunbeth Logistics Ltd', tier: 'Internal Fleet', totalLitersBought: 8900 },
  { id: 3, name: 'Chief Adeleke', tier: 'Retail VIP', totalLitersBought: 310 }
])
const alertsList = ref([
  { id: 1, title: 'Low Inventory Volumetric Warning', body: 'Kerosene (DPK) current volumes dropped below minimum buffer safety lines (5,200L).', type: 'critical' },
  { id: 2, title: 'Shift Closure Verification Due', body: 'Variance discrepancy cross-checking parameters reported at Channel Node Pump 04.', type: 'warning' }
])

// --- User Profile Account Parameters ---
const currentUserEmail = computed(() => auth.currentUser?.email || 'Attendant Node')
const currentUsername = computed(() => auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Staff Account')

// --- Forms Reactive Templates Buffer ---
const editForm = reactive({ fuelType: '', shiftBlock: '', litersSold: '', ratePerLiter: '', cashReceived: '', posReceived: '', date: '' })
const form = reactive({ fuelType: 'Premium Motor Spirit (PMS - Petrol)', shiftBlock: 'Morning Shift', litersSold: '', ratePerLiter: '', cashReceived: '', posReceived: '', date: new Date().toISOString().split('T')[0] })

const debtForm = reactive({ name: '', ratePerLiter: '', liters: '', outstanding: '', date: new Date().toISOString().split('T')[0] })
const supplierForm = reactive({ company: '', product: '', litersDropped: '', price: '', depot: '', date: new Date().toISOString().split('T')[0] })
const expenseForm = reactive({ description: '', category: 'Operations', amount: '' })

// --- Computed Global Ledger Summary Metrics ---
const totalLitersSold = computed(() => recentSales.value.reduce((a, c) => a + (parseFloat(c.litersSold) || 0), 0))
const totalCashCollected = computed(() => recentSales.value.reduce((a, c) => a + (parseFloat(c.cashReceived) || 0), 0))
const totalPosCollected = computed(() => recentSales.value.reduce((a, c) => a + (parseFloat(c.posReceived) || 0), 0))
const totalRevenue = computed(() => totalCashCollected.value + totalPosCollected.value)

// --- Charting Core Initialization ---
const initChart = () => {
  const ctx = document.getElementById('cashSummaryChart')
  if (!ctx || typeof Chart === 'undefined') return

  if (salesChartInstance) { salesChartInstance.destroy() }

  const sortedSales = [...recentSales.value].reverse()
  const labels = sortedSales.map(s => s.date ? s.date.substring(5) : 'Node Entry')
  const cashData = sortedSales.map(s => parseFloat(s.cashReceived) || 0)
  const posData = sortedSales.map(s => parseFloat(s.posReceived) || 0)

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['06/21', '06/22', '06/23', '06/24', '06/25'],
      datasets: [
        { label: 'Cash (₦)', data: cashData.length ? cashData : [0], borderColor: '#105533', backgroundColor: 'rgba(16, 85, 51, 0.02)', tension: 0.25, fill: true },
        { label: 'POS (₦)', data: posData.length ? posData : [0], borderColor: '#f36f21', backgroundColor: 'rgba(243, 111, 33, 0.02)', tension: 0.25, fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  })
}

watch(recentSales, () => { if(activeTab.value === 'Dashboard') nextTick(() => initChart()) }, { deep: true })
watch(activeTab, (newTab) => { if (newTab === 'Dashboard') nextTick(() => initChart()) })

// --- Pipeline Global Real-time Synchronization Listeners ---
onMounted(() => {
  onSnapshot(query(collection(db, "sales_logs"), orderBy("timestamp", "desc")), (snap) => {
    recentSales.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (typeof Chart === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      script.onload = () => initChart()
      document.head.appendChild(script)
    } else { nextTick(() => initChart()) }
  })

  onSnapshot(query(collection(db, "debts"), orderBy("timestamp", "desc")), (snap) => {
    debtsList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })

  onSnapshot(query(collection(db, "suppliers"), orderBy("timestamp", "desc")), (snap) => {
    suppliersList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })

  onSnapshot(query(collection(db, "expenses"), orderBy("timestamp", "desc")), (snap) => {
    expensesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

// --- Transaction Writes Logic Core ---
const submitSale = async () => {
  if(!form.litersSold || !form.ratePerLiter) return
  loading.value = true
  const expected = parseFloat(form.litersSold) * parseFloat(form.ratePerLiter)
  const cash = parseFloat(form.cashReceived) || 0
  const pos = parseFloat(form.posReceived) || 0
  
  try {
    await addDoc(collection(db, "sales_logs"), {
      fuelType: form.fuelType, 
      shiftBlock: form.shiftBlock,
      litersSold: parseFloat(form.litersSold), 
      ratePerLiter: parseFloat(form.ratePerLiter),
      expectedAmount: expected, 
      cashReceived: cash, 
      posReceived: pos, 
      variance: (cash + pos) - expected,
      date: form.date,
      attendantId: auth.currentUser?.uid || 'unknown', 
      attendantName: currentUsername.value,
      timestamp: new Date().toISOString()
    })
    
    Object.assign(form, { litersSold: '', ratePerLiter: '', cashReceived: '', posReceived: '', date: new Date().toISOString().split('T')[0] })
    showRecordSaleModal.value = false
  } catch (e) { console.error("Database Sale Input Error: ", e) }
  finally { loading.value = false }
}

const submitDebt = async () => {
  if(!debtForm.name || !debtForm.outstanding) return
  debtLoading.value = true
  try {
    await addDoc(collection(db, "debts"), {
      name: debtForm.name,
      ratePerLiter: parseFloat(debtForm.ratePerLiter) || 0,
      liters: parseFloat(debtForm.liters) || 0,
      outstanding: parseFloat(debtForm.outstanding) || 0,
      date: debtForm.date,
      loggedBy: currentUsername.value,
      timestamp: new Date().toISOString()
    })
    Object.assign(debtForm, { name: '', ratePerLiter: '', liters: '', outstanding: '', date: new Date().toISOString().split('T')[0] })
  } catch (e) { console.error("Database Debt Input Error: ", e) }
  finally { debtLoading.value = false }
}

const submitSupplier = async () => {
  if(!supplierForm.company || !supplierForm.litersDropped) return
  supplierLoading.value = true
  try {
    const droppedLiters = parseFloat(supplierForm.litersDropped) || 0
    const runningBaseline = suppliersList.value.reduce((acc, curr) => acc + (parseFloat(curr.litersDropped) || 0), 0)
    
    await addDoc(collection(db, "suppliers"), {
      company: supplierForm.company,
      product: supplierForm.product,
      litersDropped: droppedLiters,
      price: parseFloat(supplierForm.price) || 0,
      depot: supplierForm.depot,
      date: supplierForm.date,
      accumulatedLitres: runningBaseline + droppedLiters,
      loggedBy: currentUsername.value,
      timestamp: new Date().toISOString()
    })
    Object.assign(supplierForm, { company: '', product: '', litersDropped: '', price: '', depot: '', date: new Date().toISOString().split('T')[0] })
  } catch (e) { console.error("Database Supplier Input Error: ", e) }
  finally { supplierLoading.value = false }
}

const submitExpense = async () => {
  if(!expenseForm.description || !expenseForm.amount) return
  expenseLoading.value = true
  try {
    await addDoc(collection(db, "expenses"), {
      description: expenseForm.description,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount) || 0,
      date: new Date().toISOString().split('T')[0],
      loggedBy: currentUsername.value,
      timestamp: new Date().toISOString()
    })
    Object.assign(expenseForm, { description: '', category: 'Operations', amount: '' })
  } catch (e) { console.error("Database Expense Input Error: ", e) }
  finally { expenseLoading.value = false }
}

// --- Editing/Wiping Direct Action Interceptors ---
const startInlineEdit = (item) => {
  editingId.value = item.id
  Object.assign(editForm, { fuelType: item.fuelType, shiftBlock: item.shiftBlock, litersSold: item.litersSold, ratePerLiter: item.ratePerLiter, cashReceived: item.cashReceived, posReceived: item.posReceived, date: item.date })
}

const saveInlineEdit = async (id) => {
  const expected = parseFloat(editForm.litersSold) * parseFloat(editForm.ratePerLiter)
  const cash = parseFloat(editForm.cashReceived) || 0
  const pos = parseFloat(editForm.posReceived) || 0
  try {
    await updateDoc(doc(db, "sales_logs", id), {
      fuelType: editForm.fuelType, 
      shiftBlock: editForm.shiftBlock,
      litersSold: parseFloat(editForm.litersSold), 
      ratePerLiter: parseFloat(editForm.ratePerLiter),
      expectedAmount: expected, 
      cashReceived: cash, 
      posReceived: pos, 
      variance: (cash + pos) - expected,
      date: editForm.date
    })
    editingId.value = null
  } catch (e) { console.error("Update dropped: ", e) }
}

const deleteLog = async (id) => { if (confirm("Wipe this entry out of live logs?")) await deleteDoc(doc(db, "sales_logs", id)) }
const deleteDebtLog = async (id) => { if (confirm("Wipe this debt profile completely?")) await deleteDoc(doc(db, "debts", id)) }
const deleteSupplierLog = async (id) => { if (confirm("Wipe this supplier manifest transaction entry?")) await deleteDoc(doc(db, "suppliers", id)) }
const deleteExpenseLog = async (id) => { if (confirm("Wipe this daily operational expense entry?")) await deleteDoc(doc(db, "expenses", id)) }

const triggerLogout = async () => {
  if (confirm("Confirm node terminal session log out?")) {
    await auth.signOut()
    window.location.reload()
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98) translateY(4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
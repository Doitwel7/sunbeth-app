<script setup>

const loans = [
{
lender: "Bank Loan",
amount: "$10,000",
paid: "$4,000",
remaining: "$6,000",
due: "May 20",
status: "Active"
},
{
lender: "Friend",
amount: "$5,000",
paid: "$2,500",
remaining: "$2,500",
due: "June 10",
status: "Active"
}
]

</script>

<template>

<div class="bg-white rounded shadow">

<div class="flex justify-between p-4 border-b">

<h2 class="font-semibold text-lg">
My Loans
</h2>

<button class="bg-blue-600 text-white px-4 py-2 rounded">
Add Loan
</button>

</div>

<table class="w-full text-left">

<thead class="bg-gray-50">
<tr>
<th class="p-4">Lender</th>
<th class="p-4">Amount</th>
<th class="p-4">Paid</th>
<th class="p-4">Remaining</th>
<th class="p-4">Due</th>
<th class="p-4">Status</th>
</tr>
</thead>

<tbody>

<tr
v-for="loan in loans"
:key="loan.lender"
class="border-t"
>

<td class="p-4">{{ loan.lender }}</td>
<td class="p-4">{{ loan.amount }}</td>
<td class="p-4">{{ loan.paid }}</td>
<td class="p-4">{{ loan.remaining }}</td>
<td class="p-4">{{ loan.due }}</td>
<td class="p-4 text-yellow-600">{{ loan.status }}</td>

</tr>

</tbody>

</table>

</div>

</template>
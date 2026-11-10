---
title: "[notes-misc] Settlement & reconciliation in financial workflows"
date: 2026-08-25    
category: notes
---

today this little flowery head🌸learnt about settlement and reconciliation in financial workflows so lemme tell you something about it if you didn't know.

here's how your money flows when you make a payment for any online purchase:

1. the amount isn't immediately transferred to the merchant's bank account and instead it's held up by the payment gateway for, generally, 1-3 days.

2. during this time the gateway deducts MDR (its own fees) + GST on that MDR; so now the merchant receives {gross amount - MDR - GST on MDR}

3. on the settlement day gateway credits that net amount (after deductions) to the merchant’s bank via NEFT/RTGS. the credit carries a UTR - a transaction reference number that can cover many individual payments.

4. merchant's bank statement will show that one net credit + UTR and not list the individual purchases.  
though the gateway's settlement report does list them - every purchase, it's gross amount, MDR taken, GST on that MDR and the final net.

5. now the merchants also got their own books. they have a record from their own system(website, app etc.) about the purchase that was successfully made.

6. so now there are three different records: 
- merchant’s own books -> full gross sales 
- gateway settlement report -> detailed list of purchases + fees + net 
- bank statement -> only the net credit + UTR  

reconciliation is the process of matching these so all these records agree with eachother and doing it at scale is hard.

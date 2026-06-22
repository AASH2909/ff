# Domain

Pure business entities live here. They do not import React, Supabase, repositories, or framework code.

Entities expose behavior through methods instead of letting callers mutate raw data:

- `Order.addItem()`
- `Order.removeItem()`
- `Order.cancel()`
- `Order.markPaid()`
- `Order.refund()`
- `Product.rename()`
- `Product.changePrice()`
- `Product.activate()`
- `Product.deactivate()`
- `Payment.capture()`
- `Payment.refund()`
- `Shift.close()`

Use `toSnapshot()` when persistence or API layers need plain data.

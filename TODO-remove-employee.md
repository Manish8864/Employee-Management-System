# Remove Employee Feature (Manager Dashboard)

**Status:** Approved & ready to implement

**Files:**
1. ems-client/src/pages/manager/AllEmployees.jsx → Add Remove button + confirmation (copy AllManagers pattern)
2. Backend: ✅ DELETE /api/employees/:id exists (manager-only, auth protected)
3. Login: ✅ Deleted user → 401 (user not found)

**Steps:**
- [ ] Add deleteConfirm state
- [ ] Add Remove button in Actions column
- [ ] handleDelete → api.delete(`/employees/${id}`)
- [ ] Success → refetch employees, close modal
- [ ] Test: Remove employee → try login (fails)

**UI:** Toggle Confirm/Cancel like AllManagers.jsx

Proceed?

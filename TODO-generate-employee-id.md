# Generate readable Employee ID automatically (Manager only)

**Status:** Steps 1-3 complete ✅
1. User model `empId` ✅
2. employeeController `generateEmpId()` ✅
3. authController register auto-generates empId for employees ✅




**Information Gathered:**
- Current: MongoDB ObjectId shown (ugly)
- Need: Readable ID like `EMP001`, `EMP002` (auto-increment)
- Only managers generate during Add Employee
- Store in User model `empId` field (string, unique)

**Plan:**
1. **Backend** User model: Add `empId` field
2. **Backend** employeeController: `generateEmpId()` function (EMP + seq)
3. **Backend** AddEmployee endpoint: Auto-generate + save
4. **Frontend** AddEmployee.jsx: Display generated ID (read-only)
5. **Update** PersonalDetails/AllEmployees to prefer `empId` over `_id`

**Files:**
- ems-server/models/User.js
- ems-server/controllers/employeeController.js  
- ems-client/src/pages/manager/AddEmployee.jsx
- PersonalDetails.jsx, AllEmployees.jsx (display)

**Followup:**
- Manager adds employee → auto EMP001 shown
- Employee sees readable ID

**Status:** ✅ COMPLETE!
All steps done:
1. Backend model/controller ✅
2. Auto-generate empId ✅
3. Frontend displays empId (fallback _id) ✅

Test: `cd ems-server && npm run dev` + `cd ems-client && npm run dev`
Manager Add Employee → see EMP001 in response
PersonalDetails/AllEmployees show readable ID

New employees get auto IDs!



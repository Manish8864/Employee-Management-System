# Profile Pic for Employee Details (Manager Dashboard)

**Files to Update:**
- [x] ems-client/src/pages/manager/AllEmployees.jsx (modal + upload form)
- [ ] ems-server/routes/employeeRoutes.js (file upload route)
- [ ] Backend multer/cloudinary setup

**Plan:**
1. Add avatar display in employee modal
2. Add upload button → PUT /employees/:id with avatar URL
3. Backend file upload → save URL to User.avatar

**Status:** COMPLETED ✅
- Employee: PersonalDetails.jsx → Upload/Display profile pic  
- Manager: AllEmployees.jsx → VIEW avatars only
- Backend: Multer + disk storage + controller updated
- Test: Login employee → upload → manager sees pic


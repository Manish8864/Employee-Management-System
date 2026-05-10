# Project Assignment Feature

**Information Gathered:**
- ManagerDashboard.jsx: Quick actions buttons (employees, managers, leaves, reports). Backend supports /projects POST (manager create/assign), /projects/all GET.
- No AssignProject page exists in manager pages.
- MyProjects.jsx: Employee sees assigned projects (/projects/my), manager info populated.
- Backend ready: createProject, updateProject, getAllProjects (manager), getMyProjects (employee).

**Plan:**
1. Create ems-client/src/pages/manager/AssignProject.jsx: Form (title, description, employee select /employees, dates, submit POST /projects).
2. Add route in App.jsx for /manager/assign-project -> AssignProject.
3. Update ManagerDashboard.jsx: Add "Assign Project" button to quick actions -> /manager/assign-project.
4. Create AllProjects.jsx for manager to view/manage all projects (optional enhancement).
5. Update TODO-projects-assign.md progress.

**Dependent Files:**
- New: AssignProject.jsx
- App.jsx (route)
- ManagerDashboard.jsx (button)
- Backend no change.

**Followup:**
- `cd ems-client && npm run dev`
- Manager dashboard -> Assign Project: create, see in employee MyProjects.
- Restart server if needed.

✅ Plan approved & implemented:

- [x] Step 1: AssignProject.jsx created
- [x] Step 2: App.jsx route added (/manager/assign-project)
- [ ] Step 3: ManagerDashboard button
- [ ] Step 4: Test

**Next:** Adding button to ManagerDashboard quick actions.



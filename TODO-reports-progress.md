# Manager Employee Reports Progress Percentage

**Status:** ✅ Complete! Added project progress bar (%) to ReportsView.jsx using report.project.progress (populated).



**Information Gathered:**
ReportsView.jsx shows reports but no progress % (WeeklyReport model has no progress field)
Backend `/reports/all` populates employee/project but no progress.

**Plan:**
1. **Backend:** Add `progress` field to WeeklyReport model (0-100)
2. Update createReport to accept/save progress
3. Frontend ReportsView.jsx: Add progress bar/display for each report
4. (Optional) Manager edit progress

**Files:**
- ems-server/models/WeeklyReport.js (add progress field)
- ems-server/controllers/reportController.js (handle progress)
- ems-client/src/pages/manager/ReportsView.jsx (display progress)

Proceed?


/**
 * Dashboard Client Module
 */

const Dashboard = {
    enrollmentChart: null,
    gradesChart: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const quickAddBtn = document.getElementById('dash-quick-add-student');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                App.switchTab('students');
                Students.openAddModal();
            });
        }

        const quickUndoBtn = document.getElementById('dash-quick-undo');
        if (quickUndoBtn) {
            quickUndoBtn.addEventListener('click', () => Students.handleUndo());
        }
    },

    async load() {
        try {
            // Fetch students and marks data in parallel
            const [studentsRes, marksRes, reportsRes] = await Promise.all([
                API.get('/students'),
                API.get('/marks'),
                API.get('/reports/attendance')
            ]);

            const students = studentsRes.data || [];
            const marks = marksRes.data || [];
            const attendanceOverview = reportsRes.overview || {};

            this.updateStatCards(students, marks, attendanceOverview);
            this.renderCharts(students, marks);
            this.renderRecentActivities(students);
        } catch (error) {
            console.error('Failed to load dashboard metrics:', error);
        }
    },

    updateStatCards(students, marks, attendanceOverview) {
        // Total Students
        const totalStudentsEl = document.getElementById('stat-total-students');
        if (totalStudentsEl) totalStudentsEl.textContent = students.length;

        // Average Attendance
        const avgAttendanceEl = document.getElementById('stat-avg-attendance');
        if (avgAttendanceEl) {
            const avg = attendanceOverview.overallAveragePercentage || 0;
            avgAttendanceEl.textContent = `${avg}%`;
        }

        // Average Marks
        const avgMarksEl = document.getElementById('stat-avg-marks');
        if (avgMarksEl) {
            if (marks.length > 0) {
                const sum = marks.reduce((acc, curr) => acc + Number(curr.total_marks || 0), 0);
                avgMarksEl.textContent = `${(sum / marks.length).toFixed(1)}`;
            } else {
                avgMarksEl.textContent = '0.0';
            }
        }

        // Total Courses
        const totalCoursesEl = document.getElementById('stat-total-courses');
        if (totalCoursesEl) {
            const uniqueCourses = new Set(students.map(s => s.course)).size;
            totalCoursesEl.textContent = uniqueCourses || 4;
        }
    },

    renderCharts(students, marks) {
        if (typeof Chart === 'undefined') return;

        // 1. Course Distribution Chart
        const courseCounts = {};
        students.forEach(s => {
            courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
        });

        const courseCtx = document.getElementById('courseEnrollmentChart');
        if (courseCtx) {
            if (this.enrollmentChart) this.enrollmentChart.destroy();

            this.enrollmentChart = new Chart(courseCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(courseCounts),
                    datasets: [{
                        data: Object.values(courseCounts),
                        backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } }
                    },
                    cutout: '68%'
                }
            });
        }

        // 2. Grade Distribution Chart
        const gradeCounts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
        marks.forEach(m => {
            const g = m.grade || 'F';
            if (gradeCounts[g] !== undefined) gradeCounts[g]++;
        });

        const gradesCtx = document.getElementById('gradeDistributionChart');
        if (gradesCtx) {
            if (this.gradesChart) this.gradesChart.destroy();

            this.gradesChart = new Chart(gradesCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(gradeCounts),
                    datasets: [{
                        label: 'Total Students',
                        data: Object.values(gradeCounts),
                        backgroundColor: ['#10b981', '#34d399', '#38bdf8', '#60a5fa', '#fbbf24', '#ef4444'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    },

    renderRecentActivities(students) {
        const listEl = document.getElementById('recent-students-list');
        if (!listEl) return;

        const recent = students.slice(0, 5);
        listEl.innerHTML = recent.map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">
            ${s.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <div style="font-weight:600;font-size:13.5px;">${s.name}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${s.student_id} • ${s.course} (Sem ${s.semester})</div>
          </div>
        </div>
        <div>
          <span class="badge ${s.attendance_percentage >= 75 ? 'badge-success' : 'badge-danger'}">
            ${s.attendance_percentage}% Att.
          </span>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);padding:10px;">No recent students found.</p>';
    }
};

window.Dashboard = Dashboard;
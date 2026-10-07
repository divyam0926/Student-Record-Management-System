/**
 * Reports & Analytics Client Module
 * Supports: Student, Attendance, Marks, Top Performers, Scholarship Eligible Reports
 * Plus: PDF and Excel Export functionality
 */

const Reports = {
        currentReportType: 'students',
        currentReportData: null,

        init() {
            this.bindEvents();
        },

        bindEvents() {
            const reportSelector = document.getElementById('report-type-select');
            if (reportSelector) {
                reportSelector.addEventListener('change', (e) => {
                    this.currentReportType = e.target.value;
                    this.generateReport(this.currentReportType);
                });
            }

            const exportPdfBtn = document.getElementById('btn-export-pdf');
            if (exportPdfBtn) {
                exportPdfBtn.addEventListener('click', () => this.exportToPDF());
            }

            const exportExcelBtn = document.getElementById('btn-export-excel');
            if (exportExcelBtn) {
                exportExcelBtn.addEventListener('click', () => this.exportToExcel());
            }

            const printBtn = document.getElementById('btn-print-report');
            if (printBtn) {
                printBtn.addEventListener('click', () => window.print());
            }
        },

        async load() {
            await this.generateReport(this.currentReportType);
        },

        async generateReport(type) {
            const outputContainer = document.getElementById('report-render-area');
            if (!outputContainer) return;

            outputContainer.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);">
        <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
        <p style="margin-top:10px;">Generating ${type} report...</p>
      </div>
    `;

            try {
                if (type === 'students') {
                    const res = await API.get('/reports/students');
                    this.currentReportData = res;
                    this.renderStudentReport(res, outputContainer);
                } else if (type === 'attendance') {
                    const res = await API.get('/reports/attendance');
                    this.currentReportData = res;
                    this.renderAttendanceReport(res, outputContainer);
                } else if (type === 'marks') {
                    const res = await API.get('/reports/marks');
                    this.currentReportData = res;
                    this.renderMarksReport(res, outputContainer);
                } else if (type === 'top-performers') {
                    const res = await API.get('/reports/top-performers?limit=10');
                    this.currentReportData = res;
                    this.renderTopPerformersReport(res, outputContainer);
                } else if (type === 'scholarship') {
                    const res = await API.get('/reports/scholarship?quota=5');
                    this.currentReportData = res;
                    this.renderScholarshipReport(res, outputContainer);
                }
            } catch (error) {
                outputContainer.innerHTML = `<p style="color:var(--danger);padding:20px;">Failed to generate report: ${error.message}</p>`;
            }
        },

        renderStudentReport(data, container) {
            const students = data.students || [];
            const courses = data.courseBreakdown || [];

            container.innerHTML = `
      <div class="report-document" id="printable-report">
        <div style="border-bottom:2px solid var(--primary);padding-bottom:12px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:800;">Apex University - Comprehensive Student Record Report</h2>
          <p style="font-size:12px;color:var(--text-muted);">Generated on ${new Date().toLocaleString()} | Total Active Records: ${students.length}</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;margin-bottom:24px;">
          ${courses.map(c => `
            <div style="background:var(--bg-card-alt);padding:12px 16px;border-radius:8px;border:1px solid var(--border);">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${c.course}</div>
              <div style="font-size:20px;font-weight:800;color:var(--primary);margin:4px 0;">${c.studentCount} Students</div>
              <div style="font-size:11.5px;">Avg Attendance: <strong>${c.averageAttendance}%</strong></div>
              <div style="font-size:11.5px;">Avg Marks: <strong>${c.averageMarks}</strong></div>
            </div>
          `).join('')}
        </div>

        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Attendance %</th>
              <th>Average Marks</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td><strong>${s.student_id}</strong></td>
                <td>${s.name}</td>
                <td><span class="badge badge-info">${s.course}</span></td>
                <td>Sem ${s.semester}</td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td><strong>${s.attendance_percentage}%</strong></td>
                <td><strong>${s.average_marks}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderAttendanceReport(data, container) {
    const overview = data.overview || {};
    const defaulters = data.defaulters || [];
    const high = data.highAttendance || [];

    container.innerHTML = `
      <div class="report-document" id="printable-report">
        <div style="border-bottom:2px solid var(--primary);padding-bottom:12px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:800;">Academic Attendance Evaluation Report</h2>
          <p style="font-size:12px;color:var(--text-muted);">Overall Institutional Average: ${overview.overallAveragePercentage}%</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:24px;">
          <div style="background:var(--success-light);color:var(--success);padding:16px;border-radius:8px;">
            <div style="font-size:12px;font-weight:700;">HIGH ATTENDANCE (>85%)</div>
            <div style="font-size:26px;font-weight:800;">${overview.highAttendanceCount}</div>
            <div style="font-size:11px;">Qualifies for scholarship</div>
          </div>
          <div style="background:var(--warning-light);color:var(--warning);padding:16px;border-radius:8px;">
            <div style="font-size:12px;font-weight:700;">SATISFACTORY (75% - 85%)</div>
            <div style="font-size:26px;font-weight:800;">${overview.averageAttendanceCount}</div>
            <div style="font-size:11px;">Eligible for semester exams</div>
          </div>
          <div style="background:var(--danger-light);color:var(--danger);padding:16px;border-radius:8px;">
            <div style="font-size:12px;font-weight:700;">DEFAULTERS (<75%)</div>
            <div style="font-size:26px;font-weight:800;">${overview.defaultersCount}</div>
            <div style="font-size:11px;">Notice required</div>
          </div>
        </div>

        <h3 style="font-size:15px;margin-bottom:10px;color:var(--danger);"><i class="fas fa-exclamation-triangle"></i> Attendance Defaulters Notice List (&lt; 75%)</h3>
        <table class="custom-table" style="margin-bottom:24px;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Contact Email</th>
              <th>Attendance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${defaulters.map(s => `
              <tr>
                <td><strong>${s.student_id}</strong></td>
                <td>${s.name}</td>
                <td>${s.course}</td>
                <td>Sem ${s.semester}</td>
                <td>${s.email}</td>
                <td><strong style="color:var(--danger);">${s.attendance_percentage}%</strong></td>
                <td><span class="badge badge-danger">Shortage Warning</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderMarksReport(data, container) {
    const grades = data.gradeDistribution || {};
    const subjects = data.subjectBreakdown || [];

    container.innerHTML = `
      <div class="report-document" id="printable-report">
        <div style="border-bottom:2px solid var(--primary);padding-bottom:12px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:800;">Academic Performance & Marks Analysis Report</h2>
          <p style="font-size:12px;color:var(--text-muted);">Total Subject Assessments Evaluated: ${data.totalEvaluations}</p>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
          ${Object.entries(grades).map(([g, count]) => `
            <div style="flex:1;min-width:100px;background:var(--bg-card-alt);border:1px solid var(--border);padding:12px;border-radius:8px;text-align:center;">
              <span class="grade-badge grade-${g.replace('+','plus')}" style="margin-bottom:6px;">${g}</span>
              <div style="font-size:20px;font-weight:800;">${count}</div>
              <div style="font-size:11px;color:var(--text-muted);">Students</div>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size:15px;margin-bottom:10px;">Subject-Wise Performance Breakdown</h3>
        <table class="custom-table">
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Students Count</th>
              <th>Average Score</th>
              <th>Highest Score</th>
              <th>Lowest Score</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(sub => `
              <tr>
                <td><strong>${sub.subject}</strong></td>
                <td style="text-align:center;">${sub.studentsCount}</td>
                <td style="text-align:center;"><strong>${sub.averageScore}</strong> / 100</td>
                <td style="text-align:center;color:var(--success);font-weight:700;">${sub.highestScore}</td>
                <td style="text-align:center;color:var(--danger);">${sub.lowestScore}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderTopPerformersReport(data, container) {
    const top = data.data || [];

    container.innerHTML = `
      <div class="report-document" id="printable-report">
        <div style="border-bottom:2px solid var(--primary);padding-bottom:12px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:800;"><i class="fas fa-trophy" style="color:var(--warning);"></i> Top Performing Students (Dean's Merit Honor Roll)</h2>
          <p style="font-size:12px;color:var(--text-muted);">Ranked strictly on cumulative score and semester performance</p>
        </div>

        <table class="custom-table">
          <thead>
            <tr>
              <th style="width:60px;">Rank</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Average Marks</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            ${top.map(s => {
              let medal = '';
              if (s.rank === 1) medal = '🥇 ';
              else if (s.rank === 2) medal = '🥈 ';
              else if (s.rank === 3) medal = '🥉 ';

              return `
                <tr ${s.rank <= 3 ? 'style="background:rgba(245, 158, 11, 0.05);"' : ''}>
                  <td style="font-weight:800;font-size:15px;">${medal}#${s.rank}</td>
                  <td><strong>${s.student_id}</strong></td>
                  <td><strong>${s.name}</strong></td>
                  <td><span class="badge badge-info">${s.course}</span></td>
                  <td>Sem ${s.semester}</td>
                  <td style="font-size:15px;color:var(--primary);font-weight:800;">${s.average_marks}</td>
                  <td><span class="badge badge-success">${s.attendance_percentage}%</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderScholarshipReport(data, container) {
    const awarded = data.selectedRecipients || [];
    const waitlisted = data.waitlisted || [];
    const summary = data.summary || {};

    container.innerHTML = `
      <div class="report-document" id="printable-report">
        <div style="border-bottom:2px solid var(--primary);padding-bottom:12px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:800;"><i class="fas fa-award" style="color:var(--success);"></i> Merit Scholarship Selection Report (Greedy Algorithm)</h2>
          <p style="font-size:12px;color:var(--text-muted);">
            Criteria: Attendance &gt; 85% AND Marks &gt; 80% | Formula: 0.6 * Marks + 0.4 * Attendance
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-bottom:20px;">
          <div style="background:var(--bg-card-alt);padding:12px;border-radius:8px;border:1px solid var(--border);">
            <div style="font-size:11px;color:var(--text-muted);">TOTAL EVALUATED</div>
            <div style="font-size:22px;font-weight:800;">${summary.totalEvaluated}</div>
          </div>
          <div style="background:var(--bg-card-alt);padding:12px;border-radius:8px;border:1px solid var(--border);">
            <div style="font-size:11px;color:var(--text-muted);">MEET THRESHOLDS</div>
            <div style="font-size:22px;font-weight:800;color:var(--info);">${summary.eligibleCount}</div>
          </div>
          <div style="background:var(--success-light);padding:12px;border-radius:8px;">
            <div style="font-size:11px;color:var(--success);font-weight:700;">AWARDED SCHOLARSHIP</div>
            <div style="font-size:22px;font-weight:800;color:var(--success);">${summary.awardedCount}</div>
          </div>
          <div style="background:var(--bg-card-alt);padding:12px;border-radius:8px;border:1px solid var(--border);">
            <div style="font-size:11px;color:var(--text-muted);">FUNDS DISBURSED</div>
            <div style="font-size:22px;font-weight:800;color:var(--primary);">₹${summary.totalBudgetDisbursed?.toLocaleString() || 0}</div>
          </div>
        </div>

        <h3 style="font-size:15px;margin-bottom:10px;color:var(--success);"><i class="fas fa-check-circle"></i> Awarded Scholars (Greedily Selected by Composite Merit)</h3>
        <table class="custom-table" style="margin-bottom:24px;">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Attendance %</th>
              <th>Avg Marks</th>
              <th>Merit Score</th>
              <th>Scholarship Grant</th>
            </tr>
          </thead>
          <tbody>
            ${awarded.map(s => `
              <tr style="background:rgba(16, 185, 129, 0.05);">
                <td style="font-weight:800;">#${s.rank}</td>
                <td><strong>${s.student_id}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td>${s.course}</td>
                <td><span class="badge badge-success">${s.attendance_percentage}%</span></td>
                <td>${s.average_marks}</td>
                <td style="color:var(--primary);font-weight:800;">${s.meritScore}</td>
                <td><span class="badge badge-success" style="font-size:13px;">₹${s.awardAmount?.toLocaleString()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${waitlisted.length > 0 ? `
          <h3 style="font-size:14px;margin-bottom:10px;color:var(--text-muted);"><i class="fas fa-clock"></i> Eligible but Waitlisted (Quota Constraint Reached)</h3>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Attendance %</th>
                <th>Avg Marks</th>
                <th>Merit Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${waitlisted.map(w => `
                <tr>
                  <td>${w.student_id}</td>
                  <td>${w.name}</td>
                  <td>${w.course}</td>
                  <td>${w.attendance_percentage}%</td>
                  <td>${w.average_marks}</td>
                  <td>${w.meritScore}</td>
                  <td><span class="badge badge-warning">Waitlisted (Quota Exceeded)</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  },

  exportToPDF() {
    const reportElement = document.getElementById('printable-report');
    if (!reportElement) {
      App.showToast('Please generate a report first.', 'warning');
      return;
    }

    if (typeof html2pdf === 'undefined') {
      window.print();
      return;
    }

    const opt = {
      margin: 10,
      filename: `SRMS_Report_${this.currentReportType}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    App.showToast('Generating PDF download...', 'info');
    html2pdf().set(opt).from(reportElement).save().then(() => {
      App.showToast('PDF downloaded successfully!', 'success');
    }).catch(err => {
      console.error(err);
      App.showToast('Export error. Falling back to print window.', 'warning');
      window.print();
    });
  },

  exportToExcel() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Excel exporter library loading...', 'warning');
      return;
    }

    const table = document.querySelector('#printable-report table');
    if (!table) {
      App.showToast('No table data to export.', 'warning');
      return;
    }

    try {
      const wb = XLSX.utils.table_to_book(table, { sheet: "ReportData" });
      const filename = `SRMS_${this.currentReportType}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, filename);
      App.showToast('Excel spreadsheet exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      App.showToast('Failed to export Excel file: ' + e.message, 'error');
    }
  }
};

window.Reports = Reports;
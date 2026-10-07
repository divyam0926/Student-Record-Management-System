/**
 * Student Management Client Module
 */

const Students = {
        data: [],
        filteredData: [],
        currentPage: 1,
        pageSize: 8,
        sortField: 'student_id',
        sortOrder: 'ASC',

        init() {
            this.bindEvents();
        },

        bindEvents() {
            // Search input
            const searchInput = document.getElementById('student-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterAndRender(e.target.value);
                });
            }

            // Filter by Course
            const courseFilter = document.getElementById('student-filter-course');
            if (courseFilter) {
                courseFilter.addEventListener('change', () => this.filterAndRender());
            }

            // Add Student Button
            const addBtn = document.getElementById('btn-add-student-modal');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.openAddModal());
            }

            // Undo Button
            const undoBtn = document.getElementById('btn-undo-action');
            if (undoBtn) {
                undoBtn.addEventListener('click', () => this.handleUndo());
            }

            // Student Form Submit
            const form = document.getElementById('student-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleSave(e));
            }

            // Auto-generate @kristujayanti.com email as name is typed
            const nameInput = document.getElementById('student-name-input');
            const emailInput = document.getElementById('student-email-input');
            if (nameInput && emailInput) {
                nameInput.addEventListener('input', () => {
                    const mode = document.getElementById('student-form-mode')?.value;
                    if (mode === 'ADD') {
                        const raw = nameInput.value.trim().toLowerCase();
                        const clean = raw.replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
                        emailInput.value = clean ? `${clean}@kristujayanti.com` : '';
                    }
                });

                emailInput.addEventListener('blur', () => {
                    let val = emailInput.value.trim().toLowerCase();
                    if (val && !val.includes('@')) {
                        emailInput.value = `${val}@kristujayanti.com`;
                    }
                });
            }
        },

        async load() {
            try {
                const res = await API.get('/students');
                this.data = res.data || [];
                this.filterAndRender();
            } catch (error) {
                App.showToast('Failed to load students: ' + error.message, 'error');
            }
        },

        filterAndRender(query = '') {
            const searchVal = (query || (document.getElementById('student-search-input') ?.value || '')).toLowerCase().trim();
            const courseVal = (document.getElementById('student-filter-course') ?.value || '').toLowerCase();

            this.filteredData = this.data.filter(s => {
                const matchesSearch = !searchVal ||
                    s.student_id.toLowerCase().includes(searchVal) ||
                    s.name.toLowerCase().includes(searchVal) ||
                    s.email.toLowerCase().includes(searchVal);

                const matchesCourse = !courseVal || s.course.toLowerCase() === courseVal;
                return matchesSearch && matchesCourse;
            });

            this.sortData();
            this.currentPage = 1;
            this.renderTable();
        },

        sortData() {
            this.filteredData.sort((a, b) => {
                let valA = a[this.sortField] !== undefined ? a[this.sortField] : '';
                let valB = b[this.sortField] !== undefined ? b[this.sortField] : '';

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return this.sortOrder === 'ASC' ? valA - valB : valB - valA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return this.sortOrder === 'ASC' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
        },

        changeSort(field) {
            if (this.sortField === field) {
                this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
            } else {
                this.sortField = field;
                this.sortOrder = 'ASC';
            }
            this.sortData();
            this.renderTable();
        },

        renderTable() {
            const tbody = document.getElementById('students-table-body');
            if (!tbody) return;

            const total = this.filteredData.length;
            const startIdx = (this.currentPage - 1) * this.pageSize;
            const endIdx = Math.min(startIdx + this.pageSize, total);
            const pageItems = this.filteredData.slice(startIdx, endIdx);

            if (pageItems.length === 0) {
                tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted);">
            <i class="fas fa-user-slash" style="font-size:24px;margin-bottom:8px;display:block;"></i>
            No student records found matching the criteria.
          </td>
        </tr>
      `;
                this.renderPagination(total, startIdx, endIdx);
                return;
            }

            tbody.innerHTML = pageItems.map(s => {
                const attVal = Number(s.attendance_percentage || 0);
                const attBadge = attVal >= 85 ?
                    '<span class="badge badge-success">High (' + attVal + '%)</span>' :
                    (attVal >= 75 ?
                        '<span class="badge badge-warning">Avg (' + attVal + '%)</span>' :
                        '<span class="badge badge-danger">Low (' + attVal + '%)</span>');

                return `
        <tr>
          <td><strong style="font-family:var(--font-mono);">${s.student_id}</strong></td>
          <td>
            <div style="font-weight:600;">${s.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">${s.email}</div>
          </td>
          <td>${s.gender}</td>
          <td>${s.dob ? s.dob.slice(0,10) : 'N/A'}</td>
          <td><span class="badge badge-info">${s.course}</span></td>
          <td style="text-align:center;">Sem ${s.semester}</td>
          <td>${attBadge}</td>
          <td><strong>${s.average_marks || 0}</strong></td>
          <td>
            <div class="table-actions">
              <button class="btn-tbl-action view" title="View Details" onclick="Students.openDetailsModal('${s.student_id}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-tbl-action edit" title="Edit Student" onclick="Students.openEditModal('${s.student_id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-tbl-action delete" title="Delete Student" onclick="Students.handleDelete('${s.student_id}', '${s.name}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
            }).join('');

            this.renderPagination(total, startIdx, endIdx);
        },

        renderPagination(total, startIdx, endIdx) {
            const infoEl = document.getElementById('student-pagination-info');
            const controlsEl = document.getElementById('student-pagination-controls');
            if (!infoEl || !controlsEl) return;

            infoEl.textContent = total > 0 ?
                `Showing ${startIdx + 1} to ${endIdx} of ${total} students` :
                'Showing 0 students';

            const totalPages = Math.ceil(total / this.pageSize) || 1;

            let html = `
      <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="Students.goToPage(${this.currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

            for (let p = 1; p <= totalPages; p++) {
                if (p === 1 || p === totalPages || (p >= this.currentPage - 1 && p <= this.currentPage + 1)) {
                    html += `
          <button class="page-btn ${p === this.currentPage ? 'active' : ''}" onclick="Students.goToPage(${p})">
            ${p}
          </button>
        `;
                } else if (p === this.currentPage - 2 || p === this.currentPage + 2) {
                    html += `<span style="padding:0 4px;color:var(--text-muted);">...</span>`;
                }
            }

            html += `
      <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="Students.goToPage(${this.currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

            controlsEl.innerHTML = html;
        },

        goToPage(p) {
            const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
            if (p < 1 || p > totalPages) return;
            this.currentPage = p;
            this.renderTable();
        },

        openAddModal() {
            const form = document.getElementById('student-form');
            if (!form) return;
            form.reset();

            document.getElementById('student-modal-title').textContent = 'Add New Student';
            document.getElementById('student-form-mode').value = 'ADD';
            document.getElementById('student-id-input').readOnly = false;

            // Suggest next ID
            const nextNum = 1000 + (this.data.length + 1);
            document.getElementById('student-id-input').value = `STU-${nextNum}`;

            App.openModal('student-modal');
        },

        openEditModal(studentId) {
            const s = this.data.find(item => item.student_id === studentId);
            if (!s) return;

            document.getElementById('student-modal-title').textContent = 'Edit Student Details';
            document.getElementById('student-form-mode').value = 'EDIT';

            const idInput = document.getElementById('student-id-input');
            idInput.value = s.student_id;
            idInput.readOnly = true;

            document.getElementById('student-name-input').value = s.name;
            document.getElementById('student-gender-input').value = s.gender;
            document.getElementById('student-dob-input').value = s.dob ? s.dob.slice(0, 10) : '';
            document.getElementById('student-email-input').value = s.email;
            document.getElementById('student-phone-input').value = s.phone;
            document.getElementById('student-address-input').value = s.address;
            document.getElementById('student-course-input').value = s.course;
            document.getElementById('student-semester-input').value = s.semester;

            App.openModal('student-modal');
        },

        async handleSave(e) {
            e.preventDefault();
            const mode = document.getElementById('student-form-mode').value;
            const student_id = document.getElementById('student-id-input').value.trim();
            const name = document.getElementById('student-name-input').value.trim();
            const gender = document.getElementById('student-gender-input').value;
            let email = document.getElementById('student-email-input').value.trim().toLowerCase();
            if (!email) {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
                email = `${slug}@kristujayanti.com`;
            } else if (!email.includes('@')) {
                email = `${email}@kristujayanti.com`;
            }

            const phone = document.getElementById('student-phone-input').value.trim();
            const address = document.getElementById('student-address-input').value.trim();
            const course = document.getElementById('student-course-input').value;
            const semester = document.getElementById('student-semester-input').value;

            const payload = { student_id, name, gender, dob, email, phone, address, course, semester };

            try {
                if (mode === 'ADD') {
                    await API.post('/students', payload);
                    App.showToast(`Student ${name} added successfully! (Pushed to Stack)`, 'success');
                } else {
                    await API.put(`/students/${student_id}`, payload);
                    App.showToast(`Student ${name} updated successfully! (Pushed to Stack)`, 'success');
                }

                App.closeModal('student-modal');
                await this.load();
                Dashboard.load();
            } catch (error) {
                App.showToast(error.message || 'Failed to save student.', 'error');
            }
        },

        async handleDelete(studentId, studentName) {
            if (!confirm(`Are you sure you want to delete student '${studentName}' (${studentId})?\nThis action can be rolled back using the Stack Undo button.`)) {
                return;
            }

            try {
                await API.delete(`/students/${studentId}`);
                App.showToast(`Student ${studentName} deleted. (Pushed to Undo Stack)`, 'info');
                await this.load();
                Dashboard.load();
            } catch (error) {
                App.showToast('Failed to delete student: ' + error.message, 'error');
            }
        },

        async handleUndo() {
            try {
                const res = await API.post('/students/undo', {});
                if (res.success) {
                    App.showToast(res.message, 'success');
                    await this.load();
                    Dashboard.load();
                }
            } catch (error) {
                App.showToast(error.message || 'Nothing to undo in stack.', 'warning');
            }
        },

        async openDetailsModal(studentId) {
            try {
                const res = await API.get(`/students/${studentId}`);
                const s = res.data;
                if (!s) return;

                const container = document.getElementById('student-details-content');
                if (!container) return;

                const att = s.attendance || {};
                const marks = s.marks || [];

                container.innerHTML = `
        <div style="display:flex;gap:20px;align-items:center;border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:16px;">
          <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">
            ${s.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <h3 style="font-size:18px;margin-bottom:2px;">${s.name}</h3>
            <p style="color:var(--text-muted);font-size:13px;">${s.student_id} • ${s.course} • Semester ${s.semester}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;font-size:13px;">
          <div><strong>Email:</strong> ${s.email}</div>
          <div><strong>Phone:</strong> ${s.phone || 'N/A'}</div>
          <div><strong>Gender:</strong> ${s.gender}</div>
          <div><strong>Date of Birth:</strong> ${s.dob ? s.dob.slice(0,10) : 'N/A'}</div>
          <div style="grid-column:1/-1;"><strong>Address:</strong> ${s.address || 'N/A'}</div>
        </div>

        <h4 style="font-size:14px;border-bottom:1px solid var(--border);padding-bottom:6px;margin-bottom:10px;">Attendance Status</h4>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;background:var(--bg-card-alt);padding:12px;border-radius:8px;">
          <div>Total Classes: <strong>${att.total_classes || 0}</strong></div>
          <div>Attended: <strong>${att.attended_classes || 0}</strong></div>
          <div>Percentage: <strong style="color:var(--primary);">${att.attendance_percentage || 0}%</strong></div>
        </div>

        <h4 style="font-size:14px;border-bottom:1px solid var(--border);padding-bottom:6px;margin-bottom:10px;">Enrolled Subjects & Marks</h4>
        ${marks.length === 0 ? '<p style="color:var(--text-muted);font-size:12px;">No marks recorded yet.</p>' : `
          <table class="custom-table" style="font-size:12.5px;">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal (30)</th>
                <th>External (70)</th>
                <th>Total (100)</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${marks.map(m => `
                <tr>
                  <td>${m.subject_name}</td>
                  <td>${m.internal_marks}</td>
                  <td>${m.external_marks}</td>
                  <td><strong>${m.total_marks}</strong></td>
                  <td><span class="grade-badge grade-${m.grade ? m.grade.replace('+', 'plus') : 'F'}">${m.grade}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      `;

      App.openModal('student-details-modal');
    } catch (error) {
      App.showToast('Failed to fetch details: ' + error.message, 'error');
    }
  }
};

window.Students = Students;
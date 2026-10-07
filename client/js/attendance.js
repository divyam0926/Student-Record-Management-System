/**
 * Attendance Management Client Module
 */

const Attendance = {
    data: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-attendance-modal');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }

        const form = document.getElementById('attendance-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSave(e));
        }

        // Auto-calculate percentage preview
        const totalInput = document.getElementById('attendance-total-classes');
        const attendedInput = document.getElementById('attendance-attended-classes');
        const previewEl = document.getElementById('attendance-calc-preview');

        const updatePreview = () => {
            const total = parseInt(totalInput ?.value || '0', 10);
            const attended = parseInt(attendedInput ?.value || '0', 10);

            if (total > 0 && attended >= 0 && attended <= total) {
                const pct = ((attended / total) * 100).toFixed(2);
                if (previewEl) {
                    previewEl.innerHTML = `Calculated Attendance: <strong style="color:${pct>=85?'var(--success)':(pct>=75?'var(--warning)':'var(--danger)')};">${pct}%</strong>`;
                }
            } else if (attended > total) {
                if (previewEl) {
                    previewEl.innerHTML = `<span style="color:var(--danger);"><i class="fas fa-exclamation-circle"></i> Attended classes cannot exceed total classes.</span>`;
                }
            } else {
                if (previewEl) previewEl.innerHTML = `Calculated Attendance: <strong>0.00%</strong>`;
            }
        };

        if (totalInput) totalInput.addEventListener('input', updatePreview);
        if (attendedInput) attendedInput.addEventListener('input', updatePreview);
    },

    async load() {
        try {
            const res = await API.get('/attendance');
            this.data = res.data || [];
            this.renderTable();
        } catch (error) {
            App.showToast('Failed to load attendance records: ' + error.message, 'error');
        }
    },

    renderTable() {
        const tbody = document.getElementById('attendance-table-body');
        if (!tbody) return;

        if (this.data.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">
            No attendance records found.
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = this.data.map(item => {
            const pct = Number(item.attendance_percentage || 0);
            let statusBadge = '';
            if (pct >= 85) statusBadge = `<span class="badge badge-success"><i class="fas fa-check-circle"></i> Eligible (${pct}%)</span>`;
            else if (pct >= 75) statusBadge = `<span class="badge badge-warning"><i class="fas fa-info-circle"></i> Satisfactory (${pct}%)</span>`;
            else statusBadge = `<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Shortage / Defaulter (${pct}%)</span>`;

            return `
        <tr>
          <td><strong style="font-family:var(--font-mono);">${item.student_id}</strong></td>
          <td><strong>${item.student_name}</strong></td>
          <td><span class="badge badge-info">${item.course}</span></td>
          <td style="text-align:center;">${item.total_classes}</td>
          <td style="text-align:center;">${item.attended_classes}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="table-actions">
              <button class="btn-tbl-action edit" title="Edit Attendance" onclick="Attendance.openEditModal(${item.attendance_id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-tbl-action delete" title="Delete Record" onclick="Attendance.handleDelete(${item.attendance_id})">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    },

    async openAddModal() {
        const form = document.getElementById('attendance-form');
        if (!form) return;
        form.reset();

        document.getElementById('attendance-modal-title').textContent = 'Record Student Attendance';
        document.getElementById('attendance-form-mode').value = 'ADD';
        document.getElementById('attendance-id-hidden').value = '';

        // Populate student select options
        const select = document.getElementById('attendance-student-select');
        if (select) {
            const studentsRes = await API.get('/students');
            const students = studentsRes.data || [];
            select.innerHTML = '<option value="">-- Select Student --</option>' +
                students.map(s => `<option value="${s.student_id}">${s.student_id} - ${s.name} (${s.course})</option>`).join('');
            select.disabled = false;
        }

        document.getElementById('attendance-calc-preview').innerHTML = 'Calculated Attendance: <strong>0.00%</strong>';
        App.openModal('attendance-modal');
    },

    async openEditModal(attendanceId) {
        const record = this.data.find(r => r.attendance_id === attendanceId);
        if (!record) return;

        document.getElementById('attendance-modal-title').textContent = 'Update Attendance Record';
        document.getElementById('attendance-form-mode').value = 'EDIT';
        document.getElementById('attendance-id-hidden').value = record.attendance_id;

        const select = document.getElementById('attendance-student-select');
        if (select) {
            select.innerHTML = `<option value="${record.student_id}">${record.student_id} - ${record.student_name}</option>`;
            select.value = record.student_id;
            select.disabled = true;
        }

        document.getElementById('attendance-total-classes').value = record.total_classes;
        document.getElementById('attendance-attended-classes').value = record.attended_classes;

        const previewEl = document.getElementById('attendance-calc-preview');
        if (previewEl) {
            previewEl.innerHTML = `Calculated Attendance: <strong style="color:var(--primary);">${record.attendance_percentage}%</strong>`;
        }

        App.openModal('attendance-modal');
    },

    async handleSave(e) {
        e.preventDefault();
        const mode = document.getElementById('attendance-form-mode').value;
        const attendance_id = document.getElementById('attendance-id-hidden').value;
        const student_id = document.getElementById('attendance-student-select').value;
        const total_classes = parseInt(document.getElementById('attendance-total-classes').value, 10);
        const attended_classes = parseInt(document.getElementById('attendance-attended-classes').value, 10);

        if (!student_id && mode === 'ADD') {
            App.showToast('Please select a student.', 'warning');
            return;
        }

        if (attended_classes > total_classes) {
            App.showToast('Attended classes cannot exceed total classes.', 'warning');
            return;
        }

        try {
            if (mode === 'ADD') {
                await API.post('/attendance', { student_id, total_classes, attended_classes });
                App.showToast('Attendance recorded successfully!', 'success');
            } else {
                await API.put(`/attendance/${attendance_id}`, { total_classes, attended_classes });
                App.showToast('Attendance updated successfully!', 'success');
            }

            App.closeModal('attendance-modal');
            await this.load();
            Students.load();
            Dashboard.load();
        } catch (error) {
            App.showToast(error.message || 'Failed to save attendance.', 'error');
        }
    },

    async handleDelete(attendanceId) {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;

        try {
            await API.delete(`/attendance/${attendanceId}`);
            App.showToast('Attendance record deleted.', 'info');
            await this.load();
            Students.load();
            Dashboard.load();
        } catch (error) {
            App.showToast('Failed to delete: ' + error.message, 'error');
        }
    }
};

window.Attendance = Attendance;
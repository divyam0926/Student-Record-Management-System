/**
 * Marks Management Client Module
 */

const Marks = {
    data: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-marks-modal');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }

        const form = document.getElementById('marks-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSave(e));
        }

        // Auto-calculate Total Marks & Grade preview
        const internalInput = document.getElementById('marks-internal');
        const externalInput = document.getElementById('marks-external');
        const totalPreview = document.getElementById('marks-total-preview');
        const gradePreview = document.getElementById('marks-grade-preview');

        const updateGradePreview = () => {
            const internal = parseFloat(internalInput ?.value || '0');
            const external = parseFloat(externalInput ?.value || '0');
            const total = Number((internal + external).toFixed(2));

            let grade = 'F';
            if (total >= 90) grade = 'A+';
            else if (total >= 80) grade = 'A';
            else if (total >= 70) grade = 'B+';
            else if (total >= 60) grade = 'B';
            else if (total >= 50) grade = 'C';

            if (totalPreview) totalPreview.textContent = total;
            if (gradePreview) {
                gradePreview.textContent = grade;
                gradePreview.className = `grade-badge grade-${grade.replace('+', 'plus')}`;
            }
        };

        if (internalInput) internalInput.addEventListener('input', updateGradePreview);
        if (externalInput) externalInput.addEventListener('input', updateGradePreview);
    },

    async load() {
        try {
            const res = await API.get('/marks');
            this.data = res.data || [];
            this.renderTable();
        } catch (error) {
            App.showToast('Failed to load marks: ' + error.message, 'error');
        }
    },

    renderTable() {
        const tbody = document.getElementById('marks-table-body');
        if (!tbody) return;

        if (this.data.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
            No marks records found.
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = this.data.map(item => {
            const g = item.grade || 'F';
            const gradeClass = `grade-${g.replace('+', 'plus')}`;

            return `
        <tr>
          <td><strong style="font-family:var(--font-mono);">${item.student_id}</strong></td>
          <td><strong>${item.student_name}</strong></td>
          <td>${item.subject_name}</td>
          <td style="text-align:center;">${item.internal_marks}</td>
          <td style="text-align:center;">${item.external_marks}</td>
          <td style="text-align:center;"><strong>${item.total_marks}</strong></td>
          <td style="text-align:center;">
            <span class="grade-badge ${gradeClass}">${g}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-tbl-action edit" title="Edit Marks" onclick="Marks.openEditModal(${item.mark_id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-tbl-action delete" title="Delete Marks" onclick="Marks.handleDelete(${item.mark_id})">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    },

    async openAddModal() {
        const form = document.getElementById('marks-form');
        if (!form) return;
        form.reset();

        document.getElementById('marks-modal-title').textContent = 'Enter Student Marks';
        document.getElementById('marks-form-mode').value = 'ADD';
        document.getElementById('marks-id-hidden').value = '';

        const select = document.getElementById('marks-student-select');
        if (select) {
            const studentsRes = await API.get('/students');
            const students = studentsRes.data || [];
            select.innerHTML = '<option value="">-- Select Student --</option>' +
                students.map(s => `<option value="${s.student_id}">${s.student_id} - ${s.name} (${s.course})</option>`).join('');
            select.disabled = false;
        }

        document.getElementById('marks-total-preview').textContent = '0';
        document.getElementById('marks-grade-preview').textContent = 'F';
        document.getElementById('marks-grade-preview').className = 'grade-badge grade-F';

        App.openModal('marks-modal');
    },

    async openEditModal(markId) {
        const record = this.data.find(r => r.mark_id === markId);
        if (!record) return;

        document.getElementById('marks-modal-title').textContent = 'Update Subject Marks';
        document.getElementById('marks-form-mode').value = 'EDIT';
        document.getElementById('marks-id-hidden').value = record.mark_id;

        const select = document.getElementById('marks-student-select');
        if (select) {
            select.innerHTML = `<option value="${record.student_id}">${record.student_id} - ${record.student_name}</option>`;
            select.value = record.student_id;
            select.disabled = true;
        }

        document.getElementById('marks-subject-name').value = record.subject_name;
        document.getElementById('marks-internal').value = record.internal_marks;
        document.getElementById('marks-external').value = record.external_marks;

        document.getElementById('marks-total-preview').textContent = record.total_marks;
        const g = record.grade || 'F';
        document.getElementById('marks-grade-preview').textContent = g;
        document.getElementById('marks-grade-preview').className = `grade-badge grade-${g.replace('+', 'plus')}`;

        App.openModal('marks-modal');
    },

    async handleSave(e) {
        e.preventDefault();
        const mode = document.getElementById('marks-form-mode').value;
        const mark_id = document.getElementById('marks-id-hidden').value;
        const student_id = document.getElementById('marks-student-select').value;
        const subject_name = document.getElementById('marks-subject-name').value.trim();
        const internal_marks = parseFloat(document.getElementById('marks-internal').value);
        const external_marks = parseFloat(document.getElementById('marks-external').value);

        if (!student_id && mode === 'ADD') {
            App.showToast('Please select a student.', 'warning');
            return;
        }

        if (!subject_name) {
            App.showToast('Subject name is required.', 'warning');
            return;
        }

        if (internal_marks < 0 || internal_marks > 30) {
            App.showToast('Internal marks must be between 0 and 30.', 'warning');
            return;
        }

        if (external_marks < 0 || external_marks > 70) {
            App.showToast('External marks must be between 0 and 70.', 'warning');
            return;
        }

        try {
            if (mode === 'ADD') {
                const res = await API.post('/marks', { student_id, subject_name, internal_marks, external_marks });
                App.showToast(`Marks added! Grade: ${res.data.grade}`, 'success');
            } else {
                const res = await API.put(`/marks/${mark_id}`, { subject_name, internal_marks, external_marks });
                App.showToast(`Marks updated! Grade: ${res.data.grade}`, 'success');
            }

            App.closeModal('marks-modal');
            await this.load();
            Students.load();
            Dashboard.load();
        } catch (error) {
            App.showToast(error.message || 'Failed to save marks.', 'error');
        }
    },

    async handleDelete(markId) {
        if (!confirm('Are you sure you want to delete this mark record?')) return;

        try {
            await API.delete(`/marks/${markId}`);
            App.showToast('Mark record deleted.', 'info');
            await this.load();
            Students.load();
            Dashboard.load();
        } catch (error) {
            App.showToast('Failed to delete: ' + error.message, 'error');
        }
    }
};

window.Marks = Marks;
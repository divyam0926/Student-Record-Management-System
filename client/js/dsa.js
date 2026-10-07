/**
 * Data Structures & Algorithmic Techniques Interactive Playground
 * Visualizer & Controller for all 10 DS & Algorithms
 */

const DSA = {
        currentTab: 'linkedlist',
        dpChartInstance: null,

        init() {
            this.bindTabButtons();
            this.bindActionEvents();
        },

        bindTabButtons() {
            const tabs = document.querySelectorAll('.dsa-tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => t.classList.remove('active'));
                    const btn = e.currentTarget;
                    btn.classList.add('active');
                    const targetPane = btn.getAttribute('data-target');
                    this.switchPane(targetPane);
                });
            });
        },

        switchPane(paneId) {
            this.currentTab = paneId;
            document.querySelectorAll('.algo-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`pane-${paneId}`);
            if (target) {
                target.classList.add('active');
            }

            // Trigger loader for specific tab
            if (paneId === 'linkedlist') this.loadLinkedList();
            else if (paneId === 'stack') this.loadStack();
            else if (paneId === 'queue') this.loadQueue();
            else if (paneId === 'bst') this.loadBST();
            else if (paneId === 'graph') this.loadGraph();
            else if (paneId === 'searching') this.loadSearching();
            else if (paneId === 'sorting') this.loadSorting();
            else if (paneId === 'greedy') this.loadGreedy();
            else if (paneId === 'dp') this.loadDP();
            else if (paneId === 'backtracking') this.loadBacktracking();
        },

        bindActionEvents() {
            // 1. Linked List
            document.getElementById('btn-ll-insert-head') ?.addEventListener('click', () => this.handleLLInsert('head'));
            document.getElementById('btn-ll-insert-tail') ?.addEventListener('click', () => this.handleLLInsert('tail'));
            document.getElementById('btn-ll-delete') ?.addEventListener('click', () => this.handleLLDelete());
            document.getElementById('btn-ll-traverse') ?.addEventListener('click', () => this.loadLinkedList());

            // 2. Stack
            document.getElementById('btn-stack-pop') ?.addEventListener('click', () => this.handleStackPop());
            document.getElementById('btn-stack-refresh') ?.addEventListener('click', () => this.loadStack());

            // 3. Queue
            document.getElementById('btn-queue-enqueue') ?.addEventListener('click', () => this.handleQueueEnqueue());
            document.getElementById('btn-queue-dequeue') ?.addEventListener('click', () => this.handleQueueDequeue());

            // 4. BST
            document.getElementById('btn-bst-search') ?.addEventListener('click', () => this.handleBSTSearch());
            document.getElementById('btn-bst-insert') ?.addEventListener('click', () => this.handleBSTInsert());

            // 5. Graph
            document.getElementById('btn-run-bfs') ?.addEventListener('click', () => this.runGraphTraversal('BFS'));
            document.getElementById('btn-run-dfs') ?.addEventListener('click', () => this.runGraphTraversal('DFS'));

            // 6. Searching
            document.getElementById('btn-run-linear-search') ?.addEventListener('click', () => this.runLinearSearch());
            document.getElementById('btn-run-binary-search') ?.addEventListener('click', () => this.runBinarySearch());

            // 7. Sorting
            document.getElementById('btn-run-bubble-sort') ?.addEventListener('click', () => this.runBubbleSort());

            // 8. Greedy
            document.getElementById('btn-run-greedy') ?.addEventListener('click', () => this.runGreedy());

            // 9. DP
            document.getElementById('btn-run-dp') ?.addEventListener('click', () => this.runDP());

            // 10. Backtracking
            document.getElementById('btn-run-backtracking') ?.addEventListener('click', () => this.runBacktracking());
        },

        // -------------------------------------------------------------
        // 1. LINKED LIST
        // -------------------------------------------------------------
        async loadLinkedList() {
            try {
                const res = await API.get('/algorithms/linked-list');
                const container = document.getElementById('ll-visual-nodes');
                const logBox = document.getElementById('ll-step-logs');
                if (!container) return;

                const nodes = res.data || [];
                if (nodes.length === 0) {
                    container.innerHTML = '<div class="ll-null-node">Empty List (Head -> null)</div>';
                    return;
                }

                container.innerHTML = nodes.map((node, i) => `
        <div class="ll-node">
          <div class="ll-node-data">
            <div class="node-id">${node.student_id}</div>
            <div class="node-name">${node.name}</div>
            <div class="node-course">${node.course}</div>
          </div>
          <div class="ll-node-pointer">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
        <div class="ll-arrow">
          <i class="fas fa-long-arrow-alt-right"></i>
        </div>
      `).join('') + '<div class="ll-null-node">NULL</div>';

                if (logBox && res.steps) {
                    logBox.innerHTML = res.steps.map(s =>
                        `<div class="step-log-entry"><i class="fas fa-angle-right" style="color:var(--primary);"></i> Visited Node [${s.student_id}]: ${s.name} (${s.course})</div>`
                    ).join('');
                }
            } catch (e) {
                console.error(e);
            }
        },

        async handleLLInsert(pos) {
            const id = document.getElementById('ll-input-id') ?.value.trim();
            const name = document.getElementById('ll-input-name') ?.value.trim();
            const course = document.getElementById('ll-input-course') ?.value.trim();

            if (!id || !name) {
                App.showToast('Please enter Student ID and Name.', 'warning');
                return;
            }

            try {
                const res = await API.post('/algorithms/linked-list/insert', {
                    student: { student_id: id, name, course: course || 'MCA' },
                    position: pos
                });
                App.showToast(res.message, 'success');
                this.loadLinkedList();
            } catch (e) {
                App.showToast(e.message, 'error');
            }
        },

        async handleLLDelete() {
            const id = document.getElementById('ll-delete-id') ?.value.trim();
            if (!id) {
                App.showToast('Enter Student ID to delete.', 'warning');
                return;
            }

            try {
                const res = await API.delete(`/algorithms/linked-list/${id}`);
                App.showToast(res.message, res.success ? 'success' : 'warning');
                this.loadLinkedList();
            } catch (e) {
                App.showToast(e.message, 'error');
            }
        },

        // -------------------------------------------------------------
        // 2. STACK (UNDO)
        // -------------------------------------------------------------
        async loadStack() {
            try {
                const res = await API.get('/algorithms/stack');
                const column = document.getElementById('stack-frames-column');
                const sizeEl = document.getElementById('stack-size-badge');
                if (!column) return;

                if (sizeEl) sizeEl.textContent = `${res.size} items`;

                const items = res.stackItems || [];
                if (items.length === 0) {
                    column.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:12px;">Stack is Empty (LIFO)</div>';
                    return;
                }

                column.innerHTML = items.map((item, idx) => `
        <div class="stack-frame ${idx === 0 ? 'top' : ''}">
          <div class="frame-type">${item.type} ${idx === 0 ? '(TOP)' : ''}</div>
          <div class="frame-desc">${item.description || item.studentId || 'Action item'}</div>
          <div class="frame-time">${new Date(item.timestamp).toLocaleTimeString()}</div>
        </div>
      `).join('');
            } catch (e) {
                console.error(e);
            }
        },

        async handleStackPop() {
            try {
                const res = await API.post('/algorithms/stack/pop');
                App.showToast(res.message, res.success ? 'info' : 'warning');
                this.loadStack();
            } catch (e) {
                App.showToast(e.message, 'error');
            }
        },

        // -------------------------------------------------------------
        // 3. QUEUE (REGISTRATION)
        // -------------------------------------------------------------
        async loadQueue() {
            try {
                const res = await API.get('/algorithms/queue');
                const conveyor = document.getElementById('queue-conveyor-slots');
                const sizeEl = document.getElementById('queue-size-badge');
                if (!conveyor) return;

                if (sizeEl) sizeEl.textContent = `${res.size} in queue`;

                const items = res.queueItems || [];
                if (items.length === 0) {
                    conveyor.innerHTML = '<div style="color:var(--text-muted);padding:20px;font-size:13px;">Registration Queue is Empty (FIFO)</div>';
                    return;
                }

                conveyor.innerHTML = items.map((item, idx) => `
        <div class="queue-slot">
          <span class="queue-badge">${idx === 0 ? 'FRONT' : (idx === items.length - 1 ? 'REAR' : `#${idx + 1}`)}</span>
          <div style="font-size:11px;font-weight:700;color:var(--secondary);">${item.ticketNumber}</div>
          <div style="font-weight:700;font-size:13px;margin:2px 0;">${item.name}</div>
          <div style="font-size:11px;color:var(--text-muted);">${item.course} • Sem ${item.semester}</div>
        </div>
        ${idx < items.length - 1 ? '<i class="fas fa-chevron-right" style="color:var(--text-muted);"></i>' : ''}
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async handleQueueEnqueue() {
    const name = document.getElementById('queue-input-name')?.value.trim();
    const email = document.getElementById('queue-input-email')?.value.trim();
    const course = document.getElementById('queue-input-course')?.value;
    const semester = document.getElementById('queue-input-semester')?.value;

    if (!name || !email) {
      App.showToast('Please enter applicant name and email.', 'warning');
      return;
    }

    let formattedEmail = email.toLowerCase();
    if (!formattedEmail.includes('@')) {
      formattedEmail = `${formattedEmail}@kristujayanti.com`;
    }

    try {
      const res = await API.post('/algorithms/queue/enqueue', { name, email: formattedEmail, course, semester });
      App.showToast(res.message, 'success');
      document.getElementById('queue-input-name').value = '';
      document.getElementById('queue-input-email').value = '';
      this.loadQueue();
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  async handleQueueDequeue() {
    try {
      const res = await API.post('/algorithms/queue/dequeue');
      App.showToast(res.message, res.success ? 'success' : 'warning');
      this.loadQueue();
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 4. BST
  // -------------------------------------------------------------
  async loadBST() {
    try {
      const res = await API.get('/algorithms/bst');
      const canvas = document.getElementById('bst-canvas-area');
      const inorderBox = document.getElementById('bst-inorder-list');
      if (!canvas) return;

      canvas.innerHTML = this.renderBSTNode(res.treeVisual);

      if (inorderBox && res.inorder) {
        inorderBox.innerHTML = res.inorder.map(s => `
          <span style="display:inline-block;padding:3px 8px;background:var(--bg-card-alt);border:1px solid var(--border);border-radius:4px;font-size:11px;margin:2px;font-family:var(--font-mono);">
            ${s.student_id} (${s.name})
          </span>
        `).join(' <i class="fas fa-arrow-right" style="color:var(--text-muted);font-size:10px;"></i> ');
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderBSTNode(node) {
    if (!node) return '<div style="color:var(--text-muted);font-size:11px;padding:10px;">[null]</div>';

    return `
      <div class="tree-node-visual" id="tree-node-${node.key}">
        <div class="tree-node-circle">
          <span>${node.key}</span>
        </div>
        <div class="tree-node-label">${node.studentId}</div>
        <div class="tree-subbranches">
          <div style="border-right:1px solid var(--border);padding-right:10px;">
            <div style="font-size:10px;color:var(--text-muted);text-align:center;">L</div>
            ${node.left ? this.renderBSTNode(node.left) : '<span style="color:var(--text-muted);font-size:10px;">•</span>'}
          </div>
          <div style="padding-left:10px;">
            <div style="font-size:10px;color:var(--text-muted);text-align:center;">R</div>
            ${node.right ? this.renderBSTNode(node.right) : '<span style="color:var(--text-muted);font-size:10px;">•</span>'}
          </div>
        </div>
      </div>
    `;
  },

  async handleBSTSearch() {
    const id = document.getElementById('bst-search-input')?.value.trim();
    if (!id) {
      App.showToast('Enter student ID to search.', 'warning');
      return;
    }

    try {
      const res = await API.get(`/algorithms/bst/search/${id}`);
      const logBox = document.getElementById('bst-search-logs');
      App.showToast(res.message, res.found ? 'success' : 'warning');

      if (logBox && res.path) {
        logBox.innerHTML = res.path.map((p, i) => `
          <div class="step-log-entry">
            Step ${i+1}: Checked node [${p.nodeId}] (Key: ${p.key}) -> Action: <strong>${p.action}</strong>
          </div>
        `).join('');
      }

      // Highlight matching node
      document.querySelectorAll('.tree-node-circle').forEach(el => el.classList.remove('highlight'));
      if (res.found) {
        const matchKey = res.student ? res.student.student_id.replace(/\D/g, '') : null;
        if (matchKey) {
          const matchedEl = document.querySelector(`#tree-node-${matchKey} .tree-node-circle`);
          if (matchedEl) matchedEl.classList.add('highlight');
        }
      }
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  async handleBSTInsert() {
    const id = document.getElementById('bst-insert-id')?.value.trim();
    const name = document.getElementById('bst-insert-name')?.value.trim();
    if (!id || !name) {
      App.showToast('Enter ID and name for tree node.', 'warning');
      return;
    }

    try {
      const res = await API.post('/algorithms/bst/insert', {
        student: { student_id: id, name, course: 'MCA' }
      });
      App.showToast(`Inserted [${id}] into BST!`, 'success');
      this.loadBST();
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 5. GRAPH + BFS + DFS
  // -------------------------------------------------------------
  async loadGraph() {
    await this.runGraphTraversal('BFS');
  },

  async runGraphTraversal(type) {
    try {
      const res = await API.get('/algorithms/graph');
      const result = type === 'BFS' ? res.bfsResult : res.dfsResult;
      const chipBox = document.getElementById('graph-traversal-chips');
      const logBox = document.getElementById('graph-step-logs');
      const titleEl = document.getElementById('graph-traversal-title');

      if (titleEl) {
        titleEl.textContent = `${result.algorithm} Traversal (${result.totalVisited} Nodes Visited)`;
      }

      if (chipBox && result.traversalOrder) {
        chipBox.innerHTML = result.traversalOrder.map((node, i) => `
          <div class="traversal-chip ${node.type}">
            <span style="font-family:var(--font-mono);font-size:10px;opacity:0.7;">#${i+1}</span>
            <span>${node.label}</span>
          </div>
        `).join(' <i class="fas fa-arrow-right" style="color:var(--text-muted);font-size:11px;"></i> ');
      }

      if (logBox && result.stepLogs) {
        logBox.innerHTML = result.stepLogs.map(l => `<div class="step-log-entry">${l}</div>`).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // -------------------------------------------------------------
  // 6. SEARCHING
  // -------------------------------------------------------------
  async loadSearching() {
    // Defaults ready
  },

  async runLinearSearch() {
    const query = document.getElementById('search-linear-name')?.value.trim();
    if (!query) {
      App.showToast('Please enter student name to search.', 'warning');
      return;
    }

    try {
      const res = await API.post('/algorithms/search/linear', { query });
      document.getElementById('linear-time-metric').textContent = res.executionTimeMs;
      document.getElementById('linear-comp-metric').textContent = `${res.comparisons} comparisons`;

      const logBox = document.getElementById('linear-search-logs');
      if (logBox && res.steps) {
        logBox.innerHTML = res.steps.map(s => `
          <div class="step-log-entry" style="${s.isMatch ? 'color:var(--success);font-weight:700;' : ''}">
            ${s.explanation}
          </div>
        `).join('');
      }

      App.showToast(res.found ? `Linear Search found ${res.matchCount} match(es)!` : 'No matches found.', res.found ? 'success' : 'warning');
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  async runBinarySearch() {
    const studentId = document.getElementById('search-binary-id')?.value.trim();
    if (!studentId) {
      App.showToast('Please enter student ID to search.', 'warning');
      return;
    }

    try {
      const res = await API.post('/algorithms/search/binary', { studentId });
      document.getElementById('binary-time-metric').textContent = res.executionTimeMs;
      document.getElementById('binary-comp-metric').textContent = `${res.comparisons} comparisons`;

      const logBox = document.getElementById('binary-search-logs');
      if (logBox && res.steps) {
        logBox.innerHTML = res.steps.map(s => `
          <div class="step-log-entry">
            Step ${s.step}: [Low: ${s.low}, Mid: ${s.mid} (${s.midId}), High: ${s.high}] -> ${s.action}
          </div>
        `).join('');
      }

      App.showToast(res.found ? `Binary Search found ${res.student.name} in ${res.comparisons} steps!` : 'Student ID not found in array.', res.found ? 'success' : 'warning');
    } catch (e) {
      App.showToast(e.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 7. SORTING (BUBBLE SORT)
  // -------------------------------------------------------------
  async loadSorting() {
    await this.runBubbleSort();
  },

  async runBubbleSort() {
    const field = document.getElementById('bubble-sort-field')?.value || 'average_marks';
    const direction = document.getElementById('bubble-sort-dir')?.value || 'desc';

    try {
      const res = await API.get(`/algorithms/sort/bubble?field=${field}&direction=${direction}`);
      document.getElementById('bubble-comp-metric').textContent = `${res.totalComparisons} comparisons`;
      document.getElementById('bubble-swaps-metric').textContent = `${res.totalSwaps} swaps`;
      document.getElementById('bubble-passes-metric').textContent = `${res.totalPasses} passes`;
      document.getElementById('bubble-time-metric').textContent = res.executionTimeMs;

      const resultsBox = document.getElementById('bubble-sorted-results');
      if (resultsBox && res.sortedData) {
        resultsBox.innerHTML = res.sortedData.map((s, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-card-alt);border:1px solid var(--border);border-radius:6px;margin-bottom:6px;">
            <div>
              <strong style="margin-right:8px;">#${idx+1}</strong>
              <span>${s.name} (${s.student_id})</span>
            </div>
            <div>
              <span class="badge badge-info">${field}: ${s[field] !== undefined ? s[field] : s.average_marks}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // -------------------------------------------------------------
  // 8. GREEDY SCHOLARSHIP
  // -------------------------------------------------------------
  async loadGreedy() {
    await this.runGreedy();
  },

  async runGreedy() {
    const quota = parseInt(document.getElementById('greedy-quota-input')?.value || '4', 10);

    try {
      const res = await API.post('/algorithms/greedy/scholarship', { quota });
      document.getElementById('greedy-eligible-metric').textContent = res.summary.eligibleCount;
      document.getElementById('greedy-awarded-metric').textContent = res.summary.awardedCount;
      document.getElementById('greedy-budget-metric').textContent = `₹${res.summary.totalBudgetDisbursed.toLocaleString()}`;

      const awardedBox = document.getElementById('greedy-awarded-cards');
      if (awardedBox && res.selectedRecipients) {
        awardedBox.innerHTML = res.selectedRecipients.map(s => `
          <div style="background:var(--bg-card);border:2px solid var(--success);border-radius:8px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span class="badge badge-success">Rank #${s.rank}</span>
              <h4 style="font-size:15px;margin:4px 0;">${s.name} (${s.student_id})</h4>
              <div style="font-size:12px;color:var(--text-muted);">
                Marks: <strong>${s.average_marks}%</strong> | Attendance: <strong>${s.attendance_percentage}%</strong>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:var(--text-muted);">MERIT SCORE</div>
              <div style="font-size:20px;font-weight:800;color:var(--primary);">${s.meritScore}</div>
              <span class="badge badge-success">Grant: ₹${s.awardAmount.toLocaleString()}</span>
            </div>
          </div>
        `).join('');
      }

      const logBox = document.getElementById('greedy-trace-logs');
      if (logBox && res.allocationTrace) {
        logBox.innerHTML = res.allocationTrace.map(t => `
          <div class="step-log-entry">
            <strong>Rank #${t.rank} [${t.student_id}] ${t.name}</strong> (Merit: ${t.meritScore}) -> <span style="${t.action.includes('ACCEPTED') ? 'color:var(--success);' : 'color:var(--warning);'}">${t.action}</span>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // -------------------------------------------------------------
  // 9. DYNAMIC PROGRAMMING TREND
  // -------------------------------------------------------------
  async loadDP() {
    await this.runDP();
  },

  async runDP() {
    try {
      const res = await API.get('/algorithms/dp/trend');
      document.getElementById('dp-streak-metric').textContent = `${res.maxContinuousGrowthStreak} Semesters`;
      document.getElementById('dp-growth-metric').textContent = `${res.overallDeltaMarks} pts (${res.trendClassification})`;

      // Render DP Table
      const tableBody = document.getElementById('dp-table-body');
      if (tableBody && res.dpTable) {
        tableBody.innerHTML = res.dpTable.map(row => {
          const isStreak = res.optimalProgressionStreak.some(s => s.semester === row.semester);
          return `
            <tr>
              <td>Sem ${row.semester}</td>
              <td><strong>${row.marks}</strong></td>
              <td class="${isStreak ? 'highlight-streak' : ''}">${row.dpValue}</td>
              <td>${row.predecessorIndex !== -1 ? `Sem ${res.dpTable[row.predecessorIndex].semester}` : 'Start'}</td>
            </tr>
          `;
        }).join('');
      }

      // Render DP Trend Chart
      const ctx = document.getElementById('dpTrajectoryChart');
      if (ctx && typeof Chart !== 'undefined') {
        if (this.dpChartInstance) this.dpChartInstance.destroy();

        this.dpChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: res.chartData.labels,
            datasets: [
              {
                label: 'All Semester Marks',
                data: res.chartData.allMarks,
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                tension: 0.3,
                fill: false,
                borderDash: [5, 5]
              },
              {
                label: 'DP Longest Growth Streak',
                data: res.chartData.streakMarks,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.2,
                pointRadius: 6,
                pointBackgroundColor: '#10b981',
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { min: 50, max: 100 }
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  // -------------------------------------------------------------
  // 10. BACKTRACKING COURSE VALIDATION
  // -------------------------------------------------------------
  async loadBacktracking() {
    await this.runBacktracking();
  },

  async runBacktracking() {
    const completedInput = document.getElementById('bt-completed-courses')?.value || 'CS101';
    const targetCount = parseInt(document.getElementById('bt-target-count')?.value || '3', 10);
    const maxCredits = parseInt(document.getElementById('bt-max-credits')?.value || '11', 10);

    const completedCourses = completedInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    try {
      const res = await API.post('/algorithms/backtracking/courses', {
        completedCourses,
        targetCoursesCount: targetCount,
        maxCredits
      });

      document.getElementById('bt-plans-metric').textContent = `${res.statistics.validCombinationsFound} Valid Plans`;
      document.getElementById('bt-pruned-metric').textContent = `${res.statistics.prunedBranchesCount} Pruned Branches`;
      document.getElementById('bt-states-metric').textContent = `${res.statistics.totalStatesExplored} States`;

      const plansBox = document.getElementById('bt-valid-plans-list');
      if (plansBox && res.validPlans) {
        plansBox.innerHTML = res.validPlans.map(p => `
          <div style="background:var(--bg-card-alt);border:1px solid var(--primary);border-radius:8px;padding:12px 16px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <strong style="color:var(--primary);">Plan #${p.planId}</strong>
              <span class="badge badge-info">${p.totalCredits} Total Credits</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${p.courses.map(c => `
                <span style="font-size:12px;background:var(--bg-card);border:1px solid var(--border);padding:3px 8px;border-radius:4px;">
                  <strong>${c.code}</strong>: ${c.name} (${c.credits} cr)
                </span>
              `).join('')}
            </div>
          </div>
        `).join('');
      }

      const traceBox = document.getElementById('bt-execution-trace');
      if (traceBox && res.executionTrace) {
        traceBox.innerHTML = res.executionTrace.map(t => {
          let color = 'var(--text-secondary)';
          if (t.type === 'GOAL_FOUND') color = 'var(--success);font-weight:700;';
          else if (t.type.includes('PRUNED')) color = 'var(--danger);';
          else if (t.type === 'BACKTRACK') color = 'var(--warning);';

          return `<div class="step-log-entry" style="color:${color};">[${t.type}] ${t.message}</div>`;
        }).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }
};

window.DSA = DSA;
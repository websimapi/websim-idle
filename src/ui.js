import { SKILLS } from './skills.js';

export class UIManager {
    constructor(networkManager) {
        this.network = networkManager;
        this.state = null;
        this.activeTaskInterval = null;

        // Elements
        this.skillsList = document.getElementById('skills-list');
        this.authOverlay = document.getElementById('auth-overlay');
        this.skillDetails = document.getElementById('skill-details');
        this.activeTaskContainer = document.getElementById('active-task-container');
        this.energyCount = document.getElementById('energy-count');
        this.usernameDisplay = document.getElementById('username');

        // Pre-fill host channel if saved
        const savedChannel = localStorage.getItem('sq_host_channel');
        const channelInput = document.getElementById('twitch-channel-input');
        if (savedChannel && channelInput) {
            channelInput.value = savedChannel;
        }

        this.initListeners();
        this.renderSkillsList();
    }

    initListeners() {
        document.getElementById('request-link-btn').addEventListener('click', () => {
            this.network.requestLinkCode();
            document.getElementById('request-link-btn').style.display = 'none';
            document.getElementById('link-instructions').style.display = 'block';
        });

        document.getElementById('connect-twitch-btn').addEventListener('click', () => {
            const channel = document.getElementById('twitch-channel-input').value;
            if(channel) {
                this.network.connectTwitch(channel);
                document.getElementById('tmi-status').innerText = "Status: Connected to " + channel;
                document.getElementById('tmi-status').style.color = "#4ade80";
            }
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.network.stopTask();
        });

        // Network callbacks
        this.network.onLinkCode = (code) => {
            document.getElementById('link-code').innerText = code;
        };

        this.network.onLinkSuccess = (playerData) => {
            this.authOverlay.style.display = 'none';
            this.updateState(playerData);
        };

        this.network.onStateUpdate = (playerData) => {
            this.updateState(playerData);
        };
    }

    renderSkillsList() {
        this.skillsList.innerHTML = '';
        Object.values(SKILLS).forEach(skill => {
            const div = document.createElement('div');
            div.className = 'skill-item';
            div.innerHTML = `
                <img src="${skill.icon}" alt="${skill.name}">
                <span>${skill.name}</span>
            `;
            div.onclick = () => this.showSkillDetails(skill);
            this.skillsList.appendChild(div);
        });
    }

    showSkillDetails(skill) {
        this.skillDetails.style.display = 'block';
        document.getElementById('detail-icon').src = skill.icon;
        document.getElementById('detail-name').innerText = skill.name;
        document.getElementById('detail-desc').innerText = skill.description;

        const grid = document.getElementById('task-grid');
        grid.innerHTML = '';

        skill.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            const hasEnergy = this.state && this.state.energy.length > 0;
            const isBusy = this.state && this.state.activeTask;

            card.innerHTML = `
                <h4>${task.name}</h4>
                <p>Time: ${task.duration / 1000}s</p>
                <p>XP: ${task.xp}</p>
            `;

            const btn = document.createElement('button');
            btn.innerText = isBusy ? (this.state.activeTask.taskId === task.id ? "In Progress" : "Busy") : "Start";

            if (isBusy || !hasEnergy) {
                btn.disabled = true;
                if (!hasEnergy && !isBusy) btn.innerText = "No Energy";
            }

            btn.onclick = () => {
                this.network.startTask(task.id, task.duration);
            };

            card.appendChild(btn);
            grid.appendChild(card);
        });
    }

    updateState(playerData) {
        this.state = playerData;

        // Update User Info
        this.usernameDisplay.innerText = playerData.username;

        // Update Energy
        this.energyCount.innerText = `${playerData.energy.length}/12`;

        // Update Active Task UI
        if (playerData.activeTask) {
            this.activeTaskContainer.style.display = 'flex';
            this.startProgressLoop(playerData.activeTask);

            // Update Buttons in current view
            if(this.skillDetails.style.display !== 'none') {
                // Refresh grid to update disabled states
                const activeSkill = Object.values(SKILLS).find(s => 
                    s.tasks.some(t => t.id === playerData.activeTask.taskId)
                );
                if (activeSkill) { 
                    // Optional: auto-switch to active skill view?
                    // For now, just re-render if visible
                   const currentTitle = document.getElementById('detail-name').innerText;
                   const skillOfCurrentView = Object.values(SKILLS).find(s => s.name === currentTitle);
                   if(skillOfCurrentView) this.showSkillDetails(skillOfCurrentView);
                }
            }

        } else {
            this.activeTaskContainer.style.display = 'none';
            this.stopProgressLoop();

             // Refresh grid to re-enable buttons
             const currentTitle = document.getElementById('detail-name').innerText;
             const skillOfCurrentView = Object.values(SKILLS).find(s => s.name === currentTitle);
             if(skillOfCurrentView) this.showSkillDetails(skillOfCurrentView);
        }
    }

    startProgressLoop(taskData) {
        this.stopProgressLoop();

        // Find Task Info
        let taskDef = null;
        for(const s of Object.values(SKILLS)) {
            const t = s.tasks.find(t => t.id === taskData.taskId);
            if(t) { taskDef = t; break; }
        }

        if(!taskDef) return;

        document.getElementById('task-label').innerText = taskDef.name;
        const fill = document.getElementById('task-progress');

        this.activeTaskInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - taskData.startTime;
            let pct = (elapsed / taskData.duration) * 100;

            if (pct >= 100) {
                pct = 100;
                // In a real game, we'd auto-complete here, but for now we wait for server or keep it at 100
                // Since we didn't implement auto-finish in network.js for this prototype, it just loops visibly
            }

            fill.style.width = `${pct}%`;
        }, 100);
    }

    stopProgressLoop() {
        if (this.activeTaskInterval) {
            clearInterval(this.activeTaskInterval);
            this.activeTaskInterval = null;
        }
        document.getElementById('task-progress').style.width = '0%';
    }
}
// Loading Screen Simulation
document.addEventListener("DOMContentLoaded", function () {
    const loadingMessages = [
      "Chargement des ressources audio...",
      "Préparation de l'interface...",
      "Optimisation des performances...",
      "Chargement des conseils de concentration...",
      "Presque terminé...",
    ];

    let progress = 0;
    const loadingInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      if (progress > 100) progress = 100;

      document.querySelector(
        ".progress-percentage"
      ).textContent = `${progress}%`;
      document.querySelector(
        ".progress-percentage + div > div"
      ).style.width = `${progress}%`;

      // Change loading message randomly
      if (progress % 25 === 0) {
        const randomMessage =
          loadingMessages[
            Math.floor(Math.random() * loadingMessages.length)
          ];
        document.querySelector(".loading-message").textContent =
          randomMessage;
      }

      if (progress === 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          document.querySelector(".loading-screen").style.opacity = "0";
          setTimeout(() => {
            document.querySelector(".loading-screen").style.display =
              "none";
            document.querySelector(".app-content").style.display = "block";

            // Initial animations
            anime({
              targets: ".app-content",
              opacity: [0, 1],
              duration: 800,
              easing: "easeInOutQuad",
            });

            anime({
              targets: ".floating-btn",
              translateY: [-10, 0],
              duration: 2000,
              loop: true,
              direction: "alternate",
              easing: "easeInOutSine",
            });
          }, 500);
        }, 300);
      }
    }, 100);
  });

  // App State
  const state = {
    focusMode: false,
    isPaused: false,
    timerInterval: null,
    remainingTime: 0,
    currentTask: "",
    musicEnabled: true,
    currentPlaylist: "lofi",
    isPlaying: false,
    currentTrack: 0,
    shuffle: false,
    repeat: false,
    clickCount: 0,
    startTime: null,
    sessions: JSON.parse(localStorage.getItem("focusSessions")) || [],
    stats: JSON.parse(localStorage.getItem("focusStats")) || {
      totalSessions: 0,
      totalTime: 0, // in seconds
      completedSessions: 0,
      successRate: 0,
    },
  };

  // Music Playlists
  const playlists = {
    lofi: [
      {
        title: "Lofi Vibes",
        artist: "Chillhop",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/music/preview/mixkit-chill-vibes-238.mp3",
      },
      {
        title: "Coffee Break",
        artist: "Lofi Beats",
        cover:
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/music/preview/mixkit-coffee-break-238.mp3",
      },
      {
        title: "Dreamy Piano",
        artist: "Ambient Sounds",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/music/preview/mixkit-dreamy-piano-238.mp3",
      },
    ],
    classical: [
      {
        title: "Moonlight Sonata",
        artist: "Beethoven",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/music/preview/mixkit-classical-piano-118.mp3",
      },
      {
        title: "Four Seasons",
        artist: "Vivaldi",
        cover:
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/music/preview/mixkit-classical-violin-117.mp3",
      },
    ],
    nature: [
      {
        title: "Forest Sounds",
        artist: "Nature",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/sounds/preview/mixkit-forest-stream-1386.mp3",
      },
      {
        title: "Ocean Waves",
        artist: "Nature",
        cover:
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/sounds/preview/mixkit-ocean-waves-loop-1254.mp3",
      },
    ],
    "white-noise": [
      {
        title: "White Noise",
        artist: "Focus Sounds",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        audio:
          "https://assets.mixkit.co/sounds/preview/mixkit-wind-rain-and-thunder-loop-1252.mp3",
      },
    ],
  };

  // Audio Element
  const audio = new Audio();
  let currentAudioDuration = 0;

  // DOM Elements
  const focusTimer = document.getElementById("focus-timer");
  const focusTask = document.getElementById("focus-task");
  const focusMode = document.querySelector(".focus-mode");
  const focusOverlay = document.querySelector(".focus-overlay");
  const startFocusBtn = document.getElementById("start-focus");
  const pauseFocusBtn = document.getElementById("pause-focus");
  const stopFocusBtn = document.getElementById("stop-focus");
  const musicToggle = document.getElementById("music-toggle");
  const musicPlaylist = document.getElementById("music-playlist");
  const musicPlayer = document.getElementById("music-player");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-container");
  const currentTimeDisplay = document.getElementById("current-time");
  const durationDisplay = document.getElementById("duration");
  const volumeSlider = document.getElementById("volume-slider");
  const songTitle = document.querySelector(".song-title");
  const songArtist = document.querySelector(".song-artist");
  const songCover = document.querySelector(".song-cover");
  const statsModal = document.getElementById("stats-modal");
  const statsBtn = document.getElementById("stats-btn");
  const closeStats = document.getElementById("close-stats");
  const recentSessions = document.getElementById("recent-sessions");

  // Event Listeners
  startFocusBtn.addEventListener("click", startFocusSession);
  pauseFocusBtn.addEventListener("click", togglePause);
  stopFocusBtn.addEventListener("click", stopFocusSession);
  musicToggle.addEventListener("click", toggleMusic);
  musicPlaylist.addEventListener("change", changePlaylist);
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextTrack);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);
  progressContainer.addEventListener("click", setProgress);
  volumeSlider.addEventListener("input", setVolume);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", handleTrackEnd);
  audio.addEventListener("loadedmetadata", updateDuration);
  statsBtn.addEventListener("click", showStats);
  closeStats.addEventListener("click", hideStats);

  // Track clicks outside focus mode
  document.addEventListener("click", function () {
    if (state.focusMode && !state.isPaused) {
      state.clickCount++;
      showFocusOverlay();
    }
  });

  // Prevent keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (state.focusMode && !state.isPaused) {
      // Allow only media keys and Escape
      if (
        !(e.ctrlKey || e.metaKey) &&
        e.key !== "Escape" &&
        !e.key.startsWith("Media") &&
        e.key !== " "
      ) {
        e.preventDefault();
        showFocusOverlay();
      }
    }
  });

  // Initialize
  updateRecentSessions();
  loadAudioTrack();

  // Functions
  function startFocusSession() {
    const taskName = document.getElementById("task-name").value.trim();
    const hours = parseInt(document.getElementById("hours").value);
    const minutes = parseInt(document.getElementById("minutes").value);
    const seconds = parseInt(document.getElementById("seconds").value);

    if (!taskName) {
      alert("Veuillez entrer une tâche à accomplir");
      return;
    }

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      alert("Veuillez définir une durée valide");
      return;
    }

    state.focusMode = true;
    state.isPaused = false;
    state.remainingTime = totalSeconds;
    state.currentTask = taskName;
    state.startTime = new Date();
    state.clickCount = 0;

    // Update UI
    focusTask.textContent = taskName;
    updateTimerDisplay();
    document.querySelector(".app-content").style.display = "none";
    focusMode.style.display = "flex";

    // Start timer
    state.timerInterval = setInterval(updateTimer, 1000);

    // Start music if enabled
    if (state.musicEnabled) {
      audio.play().catch((e) => console.log("Auto-play prevented:", e));
      state.isPlaying = true;
      playPauseIcon.classList.replace("fa-play", "fa-pause");
    }

    // Animation
    anime({
      targets: focusMode,
      opacity: [0, 1],
      duration: 800,
      easing: "easeInOutQuad",
    });
  }

  function updateTimer() {
    if (!state.isPaused) {
      state.remainingTime--;
      updateTimerDisplay();

      if (state.remainingTime <= 0) {
        completeFocusSession(true);
      }
    }
  }

  function updateTimerDisplay() {
    const hours = Math.floor(state.remainingTime / 3600);
    const minutes = Math.floor((state.remainingTime % 3600) / 60);
    const seconds = state.remainingTime % 60;

    focusTimer.textContent = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function togglePause() {
    state.isPaused = !state.isPaused;

    if (state.isPaused) {
      pauseFocusBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Reprendre';
      pauseFocusBtn.classList.replace("bg-yellow-500", "bg-green-500");
      pauseFocusBtn.classList.replace(
        "hover:bg-yellow-600",
        "hover:bg-green-600"
      );

      if (state.musicEnabled && state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
        playPauseIcon.classList.replace("fa-pause", "fa-play");
      }
    } else {
      pauseFocusBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
      pauseFocusBtn.classList.replace("bg-green-500", "bg-yellow-500");
      pauseFocusBtn.classList.replace(
        "hover:bg-green-600",
        "hover:bg-yellow-600"
      );

      if (state.musicEnabled && !state.isPlaying) {
        audio.play();
        state.isPlaying = true;
        playPauseIcon.classList.replace("fa-play", "fa-pause");
      }

      hideFocusOverlay();
    }
  }

  function stopFocusSession() {
    const confirmStop = confirm(
      "Êtes-vous sûr de vouloir arrêter cette session de concentration ?"
    );
    if (confirmStop) {
      completeFocusSession(false);
    }
  }

  function completeFocusSession(completed) {
    clearInterval(state.timerInterval);

    const endTime = new Date();
    const duration = Math.floor((endTime - state.startTime) / 1000);
    const targetDuration = duration + state.remainingTime;
    const completionRate = Math.floor((duration / targetDuration) * 100);

    // Save session
    const session = {
      id: Date.now(),
      task: state.currentTask,
      date: new Date().toISOString(),
      targetDuration: targetDuration,
      actualDuration: duration,
      completed: completed,
      clickCount: state.clickCount,
      completionRate: completionRate,
    };

    state.sessions.unshift(session);
    localStorage.setItem("focusSessions", JSON.stringify(state.sessions));

    // Update stats
    state.stats.totalSessions++;
    state.stats.totalTime += duration;

    if (completed) {
      state.stats.completedSessions++;
    }

    state.stats.successRate = Math.floor(
      (state.stats.completedSessions / state.stats.totalSessions) * 100
    );
    localStorage.setItem("focusStats", JSON.stringify(state.stats));

    // Reset state
    state.focusMode = false;
    state.isPaused = false;
    state.remainingTime = 0;
    state.currentTask = "";
    state.clickCount = 0;

    // Stop music
    audio.pause();
    state.isPlaying = false;

    // Show completion message
    if (completed) {
      alert(
        `Félicitations ! Vous avez terminé votre session de concentration pour "${session.task}"`
      );
    } else {
      alert(
        `Session interrompue. Vous avez travaillé pendant ${formatTime(
          duration
        )} sur ${formatTime(targetDuration)} prévus.`
      );
    }

    // Return to main screen
    focusMode.style.display = "none";
    document.querySelector(".app-content").style.display = "block";
    updateRecentSessions();
  }

  function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;

    if (state.musicEnabled) {
      musicToggle.textContent = "Activé";
      musicToggle.classList.replace("bg-gray-200", "bg-indigo-100");
      musicToggle.classList.replace("text-gray-800", "text-indigo-800");
      musicPlayer.style.display = "block";

      if (state.focusMode && !state.isPaused) {
        audio.play();
        state.isPlaying = true;
        playPauseIcon.classList.replace("fa-play", "fa-pause");
      }
    } else {
      musicToggle.textContent = "Désactivé";
      musicToggle.classList.replace("bg-indigo-100", "bg-gray-200");
      musicToggle.classList.replace("text-indigo-800", "text-gray-800");
      musicPlayer.style.display = "none";

      if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
        playPauseIcon.classList.replace("fa-pause", "fa-play");
      }
    }
  }

  function changePlaylist() {
    state.currentPlaylist = musicPlaylist.value;
    state.currentTrack = 0;
    loadAudioTrack();

    if (state.isPlaying) {
      audio.play();
    }
  }

  function loadAudioTrack() {
    const playlist = playlists[state.currentPlaylist];
    const track = playlist[state.currentTrack];

    audio.src = track.audio;
    songTitle.textContent = track.title;
    songArtist.textContent = track.artist;
    songCover.src = track.cover;

    if (state.isPlaying) {
      audio.play().catch((e) => console.log("Auto-play prevented:", e));
    }
  }

  function togglePlayPause() {
    if (state.isPlaying) {
      audio.pause();
      state.isPlaying = false;
      playPauseIcon.classList.replace("fa-pause", "fa-play");
    } else {
      audio.play();
      state.isPlaying = true;
      playPauseIcon.classList.replace("fa-play", "fa-pause");
    }
  }

  function prevTrack() {
    const playlist = playlists[state.currentPlaylist];

    if (state.shuffle) {
      state.currentTrack = Math.floor(Math.random() * playlist.length);
    } else {
      state.currentTrack =
        (state.currentTrack - 1 + playlist.length) % playlist.length;
    }

    loadAudioTrack();
  }

  function nextTrack() {
    const playlist = playlists[state.currentPlaylist];

    if (state.shuffle) {
      state.currentTrack = Math.floor(Math.random() * playlist.length);
    } else {
      state.currentTrack = (state.currentTrack + 1) % playlist.length;
    }

    loadAudioTrack();
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;

    if (state.shuffle) {
      shuffleBtn.classList.add("text-indigo-500");
    } else {
      shuffleBtn.classList.remove("text-indigo-500");
    }
  }

  function toggleRepeat() {
    state.repeat = !state.repeat;
    audio.loop = state.repeat;

    if (state.repeat) {
      repeatBtn.classList.add("text-indigo-500");
    } else {
      repeatBtn.classList.remove("text-indigo-500");
    }
  }

  function updateProgress() {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update time displays
    currentTimeDisplay.textContent = formatTime(currentTime);

    if (duration) {
      durationDisplay.textContent = formatTime(duration);
    }
  }

  function updateDuration() {
    currentAudioDuration = audio.duration;
    durationDisplay.textContent = formatTime(currentAudioDuration);
  }

  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  }

  function setVolume() {
    audio.volume = volumeSlider.value;
  }

  function handleTrackEnd() {
    if (!state.repeat) {
      nextTrack();
    }
  }

  function showFocusOverlay() {
    focusOverlay.style.display = "flex";

    anime({
      targets: focusOverlay,
      opacity: [0, 1],
      duration: 300,
      easing: "easeInOutQuad",
    });

    setTimeout(() => {
      anime({
        targets: focusOverlay,
        opacity: 0,
        duration: 300,
        easing: "easeInOutQuad",
        complete: () => {
          focusOverlay.style.display = "none";
        },
      });
    }, 2000);
  }

  function hideFocusOverlay() {
    anime({
      targets: focusOverlay,
      opacity: 0,
      duration: 300,
      easing: "easeInOutQuad",
      complete: () => {
        focusOverlay.style.display = "none";
      },
    });
  }

  function showStats() {
    statsModal.style.display = "flex";

    // Update stats
    document.getElementById("total-sessions").textContent =
      state.stats.totalSessions;
    document.getElementById("total-time").textContent = formatTime(
      state.stats.totalTime
    );
    document.getElementById(
      "success-rate"
    ).textContent = `${state.stats.successRate}%`;

    // Update last session if available
    if (state.sessions.length > 0) {
      const lastSession = state.sessions[0];

      document.getElementById("last-task").textContent = lastSession.task;
      document.getElementById("last-duration").textContent = formatTime(
        lastSession.actualDuration
      );
      document.getElementById("last-target").textContent = formatTime(
        lastSession.targetDuration
      );
      document.getElementById("last-achieved").textContent = formatTime(
        lastSession.actualDuration
      );
      document.getElementById(
        "last-completion"
      ).textContent = `${lastSession.completionRate}%`;

      const feedbackCard = document.getElementById("last-feedback");
      let feedbackMessage = "";

      if (lastSession.completed) {
        feedbackCard.className = "stats-card shadow-ui p-4 success-bg";
        feedbackMessage = `Excellent travail ! Vous avez atteint 100% de votre objectif pour "${lastSession.task}".`;
      } else if (lastSession.completionRate >= 75) {
        feedbackCard.className = "stats-card shadow-ui p-4 success-bg";
        feedbackMessage = `Bon travail ! Vous avez accompli ${lastSession.completionRate}% de votre session. Presque là !`;
      } else if (lastSession.completionRate >= 50) {
        feedbackCard.className = "stats-card shadow-ui p-4 warning-bg";
        feedbackMessage = `Vous avez accompli ${lastSession.completionRate}% de votre session. Essayez de rester concentré plus longtemps la prochaine fois.`;
      } else {
        feedbackCard.className = "stats-card shadow-ui p-4 danger-bg";
        feedbackMessage = `Vous n'avez accompli que ${lastSession.completionRate}% de votre session. Essayez de réduire les distractions.`;
      }

      if (lastSession.clickCount > 5) {
        feedbackMessage += ` Vous avez quitté l'application ${lastSession.clickCount} fois pendant cette session.`;
      }

      feedbackCard.querySelector("p").textContent = feedbackMessage;
    }

    // Update history
    const historyTable = document.getElementById("sessions-history");
    historyTable.innerHTML = "";

    if (state.sessions.length > 0) {
      state.sessions.slice(0, 5).forEach((session) => {
        const row = document.createElement("tr");

        const statusClass = session.completed
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
        const statusText = session.completed ? "Terminé" : "Interrompu";

        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(
                      session.date
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      session.task
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(
                      session.targetDuration
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(
                      session.actualDuration
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                `;

        historyTable.appendChild(row);
      });
    } else {
      historyTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Aucune donnée disponible</td>
                </tr>
            `;
    }

    anime({
      targets: statsModal,
      opacity: [0, 1],
      duration: 300,
      easing: "easeInOutQuad",
    });
  }

  function hideStats() {
    anime({
      targets: statsModal,
      opacity: 0,
      duration: 300,
      easing: "easeInOutQuad",
      complete: () => {
        statsModal.style.display = "none";
      },
    });
  }

  function updateRecentSessions() {
    if (state.sessions.length > 0) {
      recentSessions.innerHTML = "";

      state.sessions.slice(0, 3).forEach((session) => {
        const sessionElement = document.createElement("div");
        sessionElement.className = "bg-gray-50 rounded-lg p-4 shadow-sm";

        const completionClass = session.completed
          ? "text-green-600"
          : "text-red-600";
        const completionIcon = session.completed
          ? "fa-check-circle"
          : "fa-times-circle";

        sessionElement.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-medium text-gray-900">${
                          session.task
                        }</h3>
                        <div class="flex items-center">
                            <i class="fas ${completionIcon} ${completionClass} mr-1"></i>
                            <span class="text-xs ${completionClass}">${
          session.completed ? "Terminé" : "Interrompu"
        }</span>
                        </div>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                        <span>${formatDate(session.date)}</span>
                        <span>${formatTime(
                          session.actualDuration
                        )} / ${formatTime(session.targetDuration)}</span>
                    </div>
                    <div class="mt-2">
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${
                              session.completionRate
                            }%"></div>
                        </div>
                    </div>
                `;

        recentSessions.appendChild(sessionElement);
      });
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, "0")}m ${secs
        .toString()
        .padStart(2, "0")}s`;
    } else {
      return `${secs.toString().padStart(2, "0")}s`;
    }
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
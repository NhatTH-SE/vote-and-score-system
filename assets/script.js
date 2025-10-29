let performances = [];
let selectedItemId = null;
let performanceMap = new Map();

async function loadPerformances() {
    const url = "https://script.google.com/macros/s/AKfycbxK5AP_UFqK2ffBt49dB7ApTN38Qy-7nWpIPIshRIu9Qe3EOrMzUYeda--q1j2sU6V-/exec";
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.performances) {
            const container = document.getElementById("vote-container");

            const newIds = new Set(data.performances.map(p => p.id));
            const oldIds = new Set(performances.map(p => p.id));


            data.performances.forEach(perf => {
                if (!performanceMap.has(perf.id)) {
                    performances.push(perf);
                    const card = createCard(perf);
                    container.appendChild(card);
                    performanceMap.set(perf.id, card);
                }
            });


            oldIds.forEach(id => {
                if (!newIds.has(id)) {
                    const card = performanceMap.get(id);
                    if (card) {
                        card.remove();
                        performanceMap.delete(id);
                        performances = performances.filter(p => p.id !== id);
                    }
                }
            });

        } else {
            console.warn("Không có dữ liệu bài hát mới");
        }
    } catch (err) {
        console.error(err);
    }
}

function createCard(perf) {
    const card = document.createElement("div");
    card.classList.add("vote-card");
    card.onclick = () => openVoteDialog(perf.id, perf.name);

    card.innerHTML = `
        <div class="card-number">${perf.id}</div>
        <div class="card-title">${perf.name}</div>
        <div class="vote-icon">→ Bình chọn</div>
    `;
    return card;
}

function openVoteDialog(itemId, itemName) {
    selectedItemId = itemId;
    document.getElementById("item-name").innerText = itemName;
    document.getElementById("modal-overlay").classList.add("active");
}

function closeModal(event) {
    if (event.target.id === "modal-overlay") {
        document.getElementById("modal-overlay").classList.remove("active");
    }
}

function submitVote(reaction) {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        userId = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("userId", userId);
    }

    const loadingText = document.getElementById("loading-text");
    loadingText.classList.add("active");

    fetch(
        `https://script.google.com/macros/s/AKfycbxK5AP_UFqK2ffBt49dB7ApTN38Qy-7nWpIPIshRIu9Qe3EOrMzUYeda--q1j2sU6V-/exec?vote=${selectedItemId}&reaction=${reaction}&user=${userId}`
    )
        .then(res => res.json())
        .then(data => {
            loadingText.classList.remove("active");
            if (data.success) {
                const item = performances.find(p => p.id === selectedItemId);
                showToast(`Bình chọn "${reaction === "like" ? "Thích" : "Không thích"}" cho "${item ? item.name : "Tiết mục"}" thành công!`, "success");
            } else {
                showToast(`Lỗi: ${data.error}`, "error");
            }
        })
        .catch(() => {
            loadingText.classList.remove("active");
            showToast("Có lỗi khi gửi dữ liệu. Vui lòng thử lại!", "error");
        });

    setTimeout(() => {
        document.getElementById("modal-overlay").classList.remove("active");
    }, 1000);
}

function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => document.body.removeChild(toast), 400);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    loadPerformances();
    setInterval(loadPerformances, 15000);
});

let performances = [];
let selectedItemId = null;


async function loadPerformances() {
    const url = "https://script.google.com/macros/s/AKfycbxK5AP_UFqK2ffBt49dB7ApTN38Qy-7nWpIPIshRIu9Qe3EOrMzUYeda--q1j2sU6V-/exec";
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.performances) {
            performances = data.performances;
            renderButtons();
        } else {
            alert("Lỗi khi tải danh sách bài hát!");
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi kết nối server!");
    }
}

function renderButtons() {
    const container = document.getElementById("vote-container");
    container.innerHTML = "";
    performances.forEach((perf, index) => {
        const card = document.createElement("div");
        card.classList.add("vote-card");
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => openVoteDialog(perf.id, perf.name);

        card.innerHTML = `
            <div class="card-number">${perf.id}</div>
            <div class="card-title">${perf.name}</div>
            <div class="vote-icon">→ Bình chọn</div>
        `;
        container.appendChild(card);
    });
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

document.addEventListener("DOMContentLoaded", loadPerformances);

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    const idx = tab === 'signin' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');
}

export function renderFooter(container) {
	if (!container) return;

	container.innerHTML = `
		<footer class="site-footer">
			<div>
				<strong>GyanPath</strong>
				<p>Question papers, practicals and study material in one place.</p>
				<p class="footer-disclaimer">This is an independent study helper, not an official IGNOU application.</p>
			</div>
			<section class="share-gyanpath" aria-labelledby="shareGyanPathTitle">
				<img src="../assets/images/gyanpath-qr.png" alt="QR code to open GyanPath" width="112" height="112" />
				<div>
					<strong id="shareGyanPathTitle">Share GyanPath</strong>
					<p>Scan the QR code or share it with another MCA student.</p>
					<div class="share-links">
						<a href="https://wa.me/?text=GyanPath%20%E2%80%94%20IGNOU%20MCA%20study%20resources%3A%20https%3A%2F%2Fraaz2507.github.io%2FMCA_IGNOU_study_helper%2F" target="_blank" rel="noopener noreferrer">WhatsApp</a>
						<a href="https://t.me/share/url?url=https%3A%2F%2Fraaz2507.github.io%2FMCA_IGNOU_study_helper%2F&amp;text=GyanPath%20%E2%80%94%20IGNOU%20MCA%20study%20resources" target="_blank" rel="noopener noreferrer">Telegram</a>
					</div>
				</div>
			</section>
			<section class="donation-section" aria-labelledby="donationTitle">
				<div class="donation-icon" aria-hidden="true">₹</div>
				<div>
					<strong id="donationTitle">Support GyanPath</strong>
					<p>Your donation helps keep IGNOU MCA resources organized, updated and free for students.</p>
					<span class="donation-button donation-button-disabled">Donation details coming soon</span>
				</div>
			</section>
			<nav class="footer-navigation" aria-label="Footer navigation">
				<a href="/">Home</a>
				<a href="/resources">Resources</a>
				<a href="/about">About</a>
				<a href="/user-guide">User Guide</a>
				<a href="/dashboard">Dashboard</a>
				<a href="/login">Login</a>
			</nav>
			<div class="footer-credit-strip">Developed by <strong>Rajaanha</strong>.</div>
		</footer>`;
}

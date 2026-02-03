async function loadSuggestedMatches(reportId) {
    const grid = document.getElementById("discoveryGrid");
    
    try {
        const response = await callLostFoundApi(`/api/reports/${reportId}/matches/`);
         //clear content
        grid.innerHTML = ""; 

        if (response.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fa-solid fa-magnifying-glass fa-3x mb-3" style="color: #415A77;"></i>
                    <h4 class="fw-bold" style="color: #1B263B;">No Matches Found Yet</h4>
                    <p class="text-muted">Don't worry! We'll notify you as soon as someone reports finding your item.</p>
                </div>`;
            return;
        }

        response.forEach(item => {
            grid.innerHTML += `
                <div class="col-md-4">
                    <div class="card match-card h-100 shadow-sm border-0">
                        <div class="card-body">
                            <span class="badge bg-navy mb-2">${item.score}% Match</span>
                            <h6 class="fw-bold">${item.item_name}</h6>
                            <p class="small text-muted">${item.description}</p>
                            <button class="btn btn-navy btn-sm w-100" onclick="claimItem('${item.id}')">Claim Item</button>
                        </div>
                    </div>
                </div>`;
        });

    } catch (error) {
        grid.innerHTML = "<p class='text-danger'>Failed to connect to the matching engine.</p>";
    }
}

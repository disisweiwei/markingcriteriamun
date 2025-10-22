// Setup page script
if (document.getElementById('setupForm')) {
    const form = document.getElementById('setupForm');
    const logoInput = document.getElementById('conferenceLogo');
    const logoPreview = document.getElementById('logoPreview');

    logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoPreview.src = e.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('conferenceName').value;
        const logo = logoPreview.src;
        
        localStorage.setItem('conferenceName', name);
        localStorage.setItem('conferenceLogo', logo);
        
        window.location.href = 'grading.html';
    });
}

// Grading page script
if (document.getElementById('gradingTable')) {
    const { jsPDF } = window.jspdf;
    
    // Load conference info
    const confName = localStorage.getItem('conferenceName') || 'MUN Conference';
    const confLogo = localStorage.getItem('conferenceLogo');
    
    document.getElementById('confName').textContent = confName;
    if (confLogo) {
        document.getElementById('confLogo').src = confLogo;
    }
    
    const table = document.getElementById('gradingTable').querySelector('tbody');
    let delegateCount = 0;
    
    function addDelegate(country = '', scores = {}) {
        delegateCount++;
        const row = table.insertRow();
        row.innerHTML = `
            <td>${delegateCount}</td>
            <td><input type="text" value="${country}" class="country-input"></td>
            <td><input type="number" value="${scores.gsl || 0}" min="0" max="20" class="score-input"></td>
            <td><input type="number" value="${scores.mod || 0}" min="0" max="10" class="score-input"></td>
            <td><input type="number" value="${scores.poi || 0}" min="0" max="5" class="score-input"></td>
            <td><input type="number" value="${scores.poiReply || 0}" min="0" max="5" class="score-input"></td>
            <td><input type="number" value="${scores.doc || 0}" min="0" max="10" class="score-input"></td>
            <td><input type="number" value="${scores.lobby || 0}" min="0" max="5" class="score-input"></td>
            <td><input type="number" value="${scores.decorum || 0}" min="0" max="5" class="score-input"></td>
            <td class="total">0</td>
            <td><button class="btn btn-secondary delete-btn">Delete</button></td>
        `;
        
        updateTotal(row);
        addEventListeners(row);
    }
    
    function updateTotal(row) {
        const inputs = row.querySelectorAll('.score-input');
        let total = 0;
        inputs.forEach(input => total += parseInt(input.value) || 0);
        row.querySelector('.total').textContent = total;
    }
    
    function addEventListeners(row) {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => updateTotal(row));
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            updateNumbers();
        });
    }
    
    function updateNumbers() {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
        delegateCount = rows.length;
    }
    
    document.getElementById('addDelegateBtn').addEventListener('click', () => addDelegate());
    
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        const doc = new jsPDF();
        
        // Add conference info
        doc.setFontSize(20);
        doc.text(confName, 20, 30);
        if (confLogo) {
            doc.addImage(confLogo, 'JPEG', 150, 10, 40, 40);
        }
        
        // Add table
        doc.autoTable({
            html: '#gradingTable',
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234] },
        });
        
        doc.save(`${confName.replace(/\s+/g, '_')}_Grading.pdf`);
    });
    
    // Add some sample data
    addDelegate('Country A', { gsl: 18, mod: 8, poi: 4, poiReply: 4, doc: 9, lobby: 4, decorum: 5 });
    addDelegate('Country B', { gsl: 16, mod: 7, poi: 3, poiReply: 3, doc: 8, lobby: 3, decorum: 4 });
}

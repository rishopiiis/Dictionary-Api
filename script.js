class DictionaryApp {
    constructor() {
        this.apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        this.wordInput = document.getElementById('wordInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultDiv = document.getElementById('result');
        this.loadingDiv = document.getElementById('loading');
        
        this.init();
    }

    init() {
        this.searchBtn.addEventListener('click', () => this.searchWord());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWord();
            }
        });
    }

    async searchWord() {
        const word = this.wordInput.value.trim();
        
        if (!word) {
            this.showError('Please enter a word');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}/${word}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Word not found');
                }
                throw new Error('Something went wrong');
            }
            
            const data = await response.json();
            this.displayResult(data[0]);
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayResult(data) {
        const word = data.word;
        const phonetic = data.phonetic || data.phonetics.find(p => p.text)?.text || '';
        const audio = data.phonetics.find(p => p.audio)?.audio || '';
        const meanings = data.meanings;

        let html = `
            <div class="word-header">
                <h2>${word}</h2>
                ${phonetic ? `<span class="phonetic">${phonetic}</span>` : ''}
                ${audio ? `<button class="audio-btn" onclick="playAudio('${audio}')">
                    <i class="fas fa-volume-up"></i>
                </button>` : ''}
            </div>
        `;

        meanings.forEach(meaning => {
            html += `
                <div class="meaning">
                    <h3 class="part-of-speech">${meaning.partOfSpeech}</h3>
            `;

            meaning.definitions.forEach((def, index) => {
                if (index < 3) { // Limit to first 3 definitions
                    html += `
                        <div class="definition">
                            <strong>${index + 1}.</strong> ${def.definition}
                    `;
                    
                    if (def.example) {
                        html += `<div class="example">"${def.example}"</div>`;
                    }
                    
                    html += `</div>`;
                }
            });

            // Add synonyms
            if (meaning.synonyms && meaning.synonyms.length > 0) {
                html += `
                    <div class="synonyms">
                        <strong>Synonyms:</strong>
                        ${meaning.synonyms.slice(0, 5).map(syn => 
                            `<span class="tag" onclick="searchWord('${syn}')">${syn}</span>`
                        ).join('')}
                    </div>
                `;
            }

            // Add antonyms
            if (meaning.antonyms && meaning.antonyms.length > 0) {
                html += `
                    <div class="antonyms">
                        <strong>Antonyms:</strong>
                        ${meaning.antonyms.slice(0, 5).map(ant => 
                            `<span class="tag" onclick="searchWord('${ant}')">${ant}</span>`
                        ).join('')}
                    </div>
                `;
            }

            html += `</div>`;
        });

        this.resultDiv.innerHTML = html;
        this.hideLoading();
    }

    showError(message) {
        this.resultDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
        this.hideLoading();
    }

    showLoading() {
        this.loadingDiv.classList.remove('hidden');
        this.resultDiv.innerHTML = '';
    }

    hideLoading() {
        this.loadingDiv.classList.add('hidden');
    }
}

// Audio playback function
function playAudio(url) {
    new Audio(url).play().catch(error => {
        console.error('Error playing audio:', error);
    });
}

// Function to search for a word (used by synonym/antonym tags)
function searchWord(word) {
    document.getElementById('wordInput').value = word;
    document.getElementById('searchBtn').click();
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DictionaryApp();
});

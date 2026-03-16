export interface Contact {
    id: number;
    name: string;
    phone: string;
    group: string;
}

export type Group = string;

export class StorageProvider {
    static getGroups(): Group[] {
        return JSON.parse(localStorage.getItem('contact-groups') || '["Друзья", "Семья", "Работа"]');
    }

    static setGroups(groups: Group[]): void {
        localStorage.setItem('contact-groups', JSON.stringify(groups));
    }

    static getContacts(): Contact[] {
        return JSON.parse(localStorage.getItem('contacts') || '[]');
    }

    static setContacts(contacts: Contact[]): void {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }
}

export class ToastService {
    private static container: HTMLElement | null = null;

    private static init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
        }
    }

    static show(message: string, isError = false) {
        this.init();
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast__icon ${isError ? 'toast__icon--error' : ''}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="toast__text">${message}</span>
        `;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
}

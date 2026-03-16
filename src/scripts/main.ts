import '../styles/main.scss';
import IMask from 'imask';
import { StorageProvider, ToastService, Contact } from './services/storage';
import { CustomDropdown } from './components/dropdown';

class ContactBookApp {
    private contacts: Contact[] = [];
    private groups: string[] = [];
    private dropdown!: CustomDropdown;
    private editingContactId: number | null = null;
    private groupIndexToDelete: number | null = null;

    private drawerOverlay = document.getElementById('drawer-overlay')!;
    private contactDrawer = document.getElementById('contact-drawer')!;
    private groupsDrawer = document.getElementById('groups-drawer')!;
    private contactsContainer = document.getElementById('contacts-container')!;
    private groupsListContainer = document.getElementById('groups-list-container')!;
    private modalOverlay = document.getElementById('modal-overlay')!;
    private phoneInput = document.getElementById('contact-phone') as HTMLInputElement;
    private nameInput = document.getElementById('contact-name') as HTMLInputElement;
    private phoneMask: any;

    constructor() {
        this.init();
    }

    private init() {
        this.contacts = StorageProvider.getContacts();
        this.groups = StorageProvider.getGroups();

        this.dropdown = new CustomDropdown('group-dropdown');
        this.dropdown.dataItems(this.groups);

        this.initPhoneMask();
        this.attachEventListeners();
        this.render();
    }

    private initPhoneMask() {
        this.phoneMask = IMask(this.phoneInput, {
            mask: '+375 (00) 000-00-00'
        });
    }

    private attachEventListeners() {
        document.getElementById('add-contact-desktop')?.addEventListener('click', () => this.openContactDrawer());
        document.getElementById('add-contact-mobile')?.addEventListener('click', () => this.openContactDrawer());
        document.getElementById('view-groups')?.addEventListener('click', () => this.openGroupsDrawer());

        document.getElementById('close-drawer')?.addEventListener('click', () => this.closeAll());
        document.getElementById('close-groups-drawer')?.addEventListener('click', () => this.closeAll());
        this.drawerOverlay.addEventListener('click', () => this.closeAll());

        document.getElementById('save-contact')?.addEventListener('click', () => this.handleSaveContact());
        document.getElementById('add-group-btn')?.addEventListener('click', () => this.addGroupInput());
        document.getElementById('save-groups')?.addEventListener('click', () => this.handleSaveGroups());

        document.getElementById('confirm-delete')?.addEventListener('click', () => this.confirmDeleteGroup());
        document.getElementById('cancel-delete')?.addEventListener('click', () => this.closeModal());
        document.getElementById('close-modal')?.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });
    }

    private openContactDrawer(contact?: Contact) {
        this.editingContactId = contact ? contact.id : null;
        const title = this.contactDrawer.querySelector('.drawer__title')!;
        title.textContent = contact ? 'Редактирование контакта' : 'Добавление контакта';

        this.nameInput.value = contact ? contact.name : '';
        this.phoneMask.value = contact ? contact.phone : '';
        this.dropdown.setValue(contact ? contact.group : '');

        this.clearErrors();
        this.contactDrawer.classList.add('active');
        this.drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    private openGroupsDrawer() {
        this.renderGroupsList();
        this.groupsDrawer.classList.add('active');
        this.drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    private closeAll() {
        this.contactDrawer.classList.remove('active');
        this.groupsDrawer.classList.remove('active');
        this.drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.dropdown.close();
    }

    private validateContact(): boolean {
        let valid = true;
        this.clearErrors();

        const name = this.nameInput.value.trim();
        const phoneUnmasked = this.phoneMask.unmaskedValue;
        const isComplete = this.phoneMask.masked.isComplete;

        if (!name) {
            this.showError('name-error', 'Поле является обязательным');
            this.nameInput.classList.add('error');
            valid = false;
        }

        if (phoneUnmasked.length <= 3) {
            this.showError('phone-error', 'Поле является обязательным');
            this.phoneInput.classList.add('error');
            valid = false;
        } else if (!isComplete) {
            this.showError('phone-error', 'Введите полный номер телефона');
            this.phoneInput.classList.add('error');
            valid = false;
        }

        const isDuplicate = this.contacts.some(c => c.phone === this.phoneMask.value && c.id !== this.editingContactId);
        if (isDuplicate) {
            ToastService.show('Контакт с таким номером уже существует', true);
            valid = false;
        }

        return valid;
    }

    private handleSaveContact() {
        if (!this.validateContact()) return;

        const newContact: Contact = {
            id: this.editingContactId || Date.now(),
            name: this.nameInput.value.trim(),
            phone: this.phoneMask.value,
            group: this.dropdown.getValue() || 'Без группы'
        };

        if (this.editingContactId) {
            this.contacts = this.contacts.map(c => c.id === this.editingContactId ? newContact : c);
            ToastService.show('Контакт успешно обновлен');
        } else {
            this.contacts.push(newContact);
            ToastService.show('Контакт успешно создан');
        }

        StorageProvider.setContacts(this.contacts);
        this.closeAll();
        this.render();
    }

    private renderGroupsList() {
        this.groupsListContainer.innerHTML = '';
        this.groups.forEach((group, index) => {
            const div = document.createElement('div');
            div.className = 'group-item';
            div.innerHTML = `
                <input type="text" class="form-input group-name-input" value="${group}">
                <button class="action-btn action-btn--delete" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6666 26.3889C12.6666 27.55 13.6166 28.5 14.7778 28.5H23.2222C24.3833 28.5 25.3333 27.55 25.3333 26.3889V13.7222H12.6666V26.3889ZM15.2633 18.8733L16.7516 17.385L19 19.6228L21.2378 17.385L22.7261 18.8733L20.4883 21.1111L22.7261 23.3489L21.2378 24.8372L19 22.5994L16.7622 24.8372L15.2739 23.3489L17.5116 21.1111L15.2633 18.8733ZM22.6944 10.5556L21.6389 9.5H16.3611L15.3055 10.5556H11.6111V12.6667H26.3889V10.5556H22.6944Z" fill="currentColor"/>
                    </svg>
                </button>
            `;
            div.querySelector('.action-btn')?.addEventListener('click', () => this.openDeleteModal(index));
            this.groupsListContainer.appendChild(div);
        });
    }

    private addGroupInput() {
        const div = document.createElement('div');
        div.className = 'group-item';
        div.innerHTML = `
            <input type="text" class="form-input group-name-input" placeholder="Название группы">
            <button class="action-btn action-btn--delete">
                <svg width="16" height="16" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.6666 26.3889C12.6666 27.55 13.6166 28.5 14.7778 28.5H23.2222C24.3833 28.5 25.3333 27.55 25.3333 26.3889V13.7222H12.6666V26.3889ZM15.2633 18.8733L16.7516 17.385L19 19.6228L21.2378 17.385L22.7261 18.8733L20.4883 21.1111L22.7261 23.3489L21.2378 24.8372L19 22.5994L16.7622 24.8372L15.2739 23.3489L17.5116 21.1111L15.2633 18.8733ZM22.6944 10.5556L21.6389 9.5H16.3611L15.3055 10.5556H11.6111V12.6667H26.3889V10.5556H22.6944Z" fill="currentColor"/>
                </svg>
            </button>
        `;
        div.querySelector('.action-btn')?.addEventListener('click', () => div.remove());
        this.groupsListContainer.appendChild(div);
    }

    private handleSaveGroups() {
        const inputs = Array.from(this.groupsListContainer.querySelectorAll('.group-name-input')) as HTMLInputElement[];
        const newGroups: string[] = [];
        let hasDuplicate = false;

        for (const input of inputs) {
            const name = input.value.trim();
            if (!name) continue;
            if (newGroups.includes(name)) {
                hasDuplicate = true;
                break;
            }
            newGroups.push(name);
        }

        if (hasDuplicate) {
            ToastService.show('Группы с одинаковыми именами запрещены', true);
            return;
        }

        this.groups = newGroups;
        StorageProvider.setGroups(this.groups);
        this.dropdown.dataItems(this.groups);
        ToastService.show('Группы успешно сохранены');
        this.renderGroupsList();
        this.render();
    }

    private openDeleteModal(index: number) {
        this.groupIndexToDelete = index;
        this.modalOverlay.classList.add('active');
    }

    private closeModal() {
        this.modalOverlay.classList.remove('active');
        this.groupIndexToDelete = null;
    }

    private confirmDeleteGroup() {
        if (this.groupIndexToDelete === null) return;

        const groupName = this.groups[this.groupIndexToDelete];
        this.groups.splice(this.groupIndexToDelete, 1);
        this.contacts = this.contacts.filter(c => c.group !== groupName);

        StorageProvider.setGroups(this.groups);
        StorageProvider.setContacts(this.contacts);
        this.dropdown.dataItems(this.groups);

        ToastService.show('Группа и контакты успешно удалены');
        this.closeModal();
        this.renderGroupsList();
        this.render();
    }

    private render() {
        this.contactsContainer.innerHTML = '';
        if (this.contacts.length === 0 && this.groups.length === 0) {
            this.contactsContainer.innerHTML = '<div class="empty-state"><p class="empty-state__text">Список контактов пуст</p></div>';
            return;
        }

        this.groups.forEach(groupName => {
            const groupContacts = this.contacts.filter(c => c.group === groupName);
            const block = document.createElement('div');
            block.className = 'group-block';
            block.innerHTML = `
                <div class="group-header">
                    <h3>${groupName}</h3>
                    <svg class="group-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="contacts-list">
                    ${groupContacts.length > 0 ? groupContacts.map(c => this.getContactHtml(c)).join('') : '<div class="contact-item"><span style="color:#A0A0A0; font-size: 14px;">В этой группе нет контактов</span></div>'}
                </div>
            `;

            block.querySelector('.group-header')?.addEventListener('click', () => block.classList.toggle('collapsed'));

            block.querySelectorAll('.action-btn').forEach(btn => {
                const id = Number((btn as HTMLElement).dataset.id);
                if ((btn as HTMLElement).classList.contains('action-btn--edit')) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openContactDrawer(this.contacts.find(c => c.id === id));
                    });
                } else {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleDeleteContact(id);
                    });
                }
            });

            this.contactsContainer.appendChild(block);
        });
    }

    private getContactHtml(c: Contact): string {
        return `
            <div class="contact-item">
                <div class="contact-info">
                    <span class="contact-name">${c.name}</span>
                </div>
                <div class="contact-phone-row">
                    <span class="contact-phone">${c.phone}</span>
                    <div class="contact-actions">
                        <button class="action-btn action-btn--edit" data-id="${c.id}">
                            <svg width="16" height="16" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 24.25V28H13.75L24.81 16.94L21.06 13.19L10 24.25ZM27.71 14.04C28.1 13.65 28.1 13.02 27.71 12.63L25.37 10.29C24.98 9.9 24.35 9.9 23.96 10.29L22.13 12.12L25.88 15.87L27.71 14.04Z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="action-btn action-btn--delete" data-id="${c.id}">
                            <svg width="16" height="16" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.6666 26.3889C12.6666 27.55 13.6166 28.5 14.7778 28.5H23.2222C24.3833 28.5 25.3333 27.55 25.3333 26.3889V13.7222H12.6666V26.3889ZM15.2633 18.8733L16.7516 17.385L19 19.6228L21.2378 17.385L22.7261 18.8733L20.4883 21.1111L22.7261 23.3489L21.2378 24.8372L19 22.5994L16.7622 24.8372L15.2739 23.3489L17.5116 21.1111L15.2633 18.8733ZM22.6944 10.5556L21.6389 9.5H16.3611L15.3055 10.5556H11.6111V12.6667H26.3889V10.5556H22.6944Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private handleDeleteContact(id: number) {
        this.contacts = this.contacts.filter(c => c.id !== id);
        StorageProvider.setContacts(this.contacts);
        ToastService.show('Контакт удален');
        this.render();
    }

    private showError(id: string, msg: string) {
        const err = document.getElementById(id)!;
        err.textContent = msg;
    }

    private clearErrors() {
        document.querySelectorAll('.form-group__error').forEach(e => e.textContent = '');
        document.querySelectorAll('.form-input').forEach(e => e.classList.remove('error'));
    }
}

new ContactBookApp();

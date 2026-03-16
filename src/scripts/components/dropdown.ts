type DropdownEvent = 'change' | 'open' | 'close';

export class CustomDropdown {
    private element: HTMLElement;
    private header: HTMLElement;
    private optionsContainer: HTMLElement;
    private selectedSpan: HTMLElement;
    private items: string[] = [];
    private selectedValue: string = '';
    private isOpen: boolean = false;
    private handlers: { [key: string]: Function[] } = {
        'change': [],
        'open': [],
        'close': []
    };

    constructor(elementId: string) {
        this.element = document.getElementById(elementId) as HTMLElement;
        this.header = this.element.querySelector('.custom-select__header') as HTMLElement;
        this.optionsContainer = this.element.querySelector('.custom-select__options') as HTMLElement;
        this.selectedSpan = this.element.querySelector('.custom-select__selected') as HTMLElement;

        this.header.addEventListener('click', () => this.toggle());

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target as Node) && this.isOpen) {
                this.close();
            }
        });
    }

    public dataItems(items: string[]): void {
        this.items = items;
        this.render();
    }

    public bind(event: DropdownEvent, callback: Function): void {
        if (this.handlers[event]) {
            this.handlers[event].push(callback);
        }
    }

    public getValue(): string {
        return this.selectedValue;
    }

    public setValue(value: string): void {
        this.selectedValue = value;
        this.selectedSpan.textContent = value || 'Выберите группу';
        this.selectedSpan.style.color = value ? '#2D2D2D' : '#A0A0A0';
        this.render();
    }

    private toggle(): void {
        this.isOpen ? this.close() : this.open();
    }

    private open(): void {
        this.isOpen = true;
        this.element.classList.add('open');
        this.trigger('open');
    }

    public close(): void {
        this.isOpen = false;
        this.element.classList.remove('open');
        this.trigger('close');
    }

    private render(): void {
        this.optionsContainer.innerHTML = '';
        this.items.forEach(item => {
            const option = document.createElement('div');
            option.className = 'custom-select__option';
            if (item === this.selectedValue) option.classList.add('selected');
            option.textContent = item;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.select(item);
            });
            this.optionsContainer.appendChild(option);
        });
    }

    private select(value: string): void {
        const oldVal = this.selectedValue;
        this.selectedValue = value;
        this.selectedSpan.textContent = value;
        this.selectedSpan.style.color = '#2D2D2D';
        this.close();
        if (oldVal !== value) {
            this.trigger('change', value);
        }
    }

    private trigger(event: DropdownEvent, data?: any): void {
        this.handlers[event].forEach(handler => handler(data));
    }
}

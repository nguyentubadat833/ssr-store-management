export abstract class IMainConsoleData {
    isOpenModal: Ref<boolean> = ref(false);
    isLoading: Ref<boolean> = ref(false);

    abstract clearState(): void

    abstract mapState(object: any): void

    abstract saveData(): Promise<void>

    abstract deleteData(): Promise<void>

    abstract refreshData(): Promise<void>
}
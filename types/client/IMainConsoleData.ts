export abstract class IMainConsoleData {
    isOpenModal: Ref<boolean> = ref(false);

    isLoading: Ref<boolean> = ref(false);

    abstract clearState(): void

    abstract mapState(object: any): void

    abstract createData(): void

    abstract deleteData(object?: any): void

    abstract saveData(): void
}
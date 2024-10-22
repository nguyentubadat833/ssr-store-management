interface IPageName {
    [key: string]: string
}

export default function () {
    const router = useRouter()
    const route = useRoute()
    const {langCurrent} = useLangConfig()
    const authRoutes = router.getRoutes().filter(route => route.meta?.isAuth === true)
    const consoleRoutes: IRouterInfo[] = authRoutes
        .filter(route => route.meta?.isConsoleMenu === true)
        .map(route => {
            return {
                name: (route.meta.pageName as IPageName)?.[`${langCurrent.value}`],
                link: route.meta.name || route.path,
                order: typeof route.meta?.order === 'number' ? route.meta.order : undefined
            }
        }).sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;
            return 0;
        });

    const pageNameCurrent = computed(() => {
        const pageNameObject = route.meta.pageName as IPageName
        return pageNameObject?.[`${langCurrent.value}`]
    })

    return{
        authRoutes,
        consoleRoutes,
        pageNameCurrent
    }
}
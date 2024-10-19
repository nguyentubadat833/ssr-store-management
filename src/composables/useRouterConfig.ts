import type {IRouterInfo} from "~/types/IRouterInfo";

export default function () {
    const router = useRouter()
    const {langCurrent} = useLangConfig()
    const authRoutes = router.getRoutes().filter(route => route.meta?.isAuth === true)
    const consoleRoutes: IRouterInfo[] = authRoutes
        .filter(route => route.meta?.isConsoleMenu === true)
        .map(route => {
            return {
                name: (route.meta?.pageName as { [key: string]: string })?.[`${langCurrent.value}`],
                link: route.meta.name || route.path,
            }
        })

    return{
        authRoutes,
        consoleRoutes
    }
}
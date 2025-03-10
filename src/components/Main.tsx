import { useMemo, PropsWithChildren, ReactElement, ReactNode } from 'react'
import {
  createStyles,
  makeStyles,
  unstable_createMuiStrictModeTheme as createMuiTheme,
  useMediaQuery,
  CssBaseline,
  Grid,
  Theme,
  ThemeProvider
} from '@material-ui/core'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'
import Menu, { backPages, drawerSectionsForYear } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import { useFocus } from 'ustaxes/hooks/Focus'
import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import YearStatusBar from './YearStatusBar'
import { useSelector } from 'react-redux'
import { TaxYear } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'

type Props = {
  isMobile: boolean
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex'
    },
    content: ({ isMobile }) => ({
      padding: '1em 2em',
      [theme.breakpoints.up('sm')]: {
        borderRadius: '5px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 20px 30px',
        margin: theme.spacing(3),
        padding: '1em 2em'
      },
      width: isMobile ? '100%' : undefined
    }),
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    }
  })
)

export default function Main(): ReactElement {
  const [ref] = useFocus()

  const activeYear: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isStartPage = useLocation().pathname === '/start'
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          secondary: prefersDarkMode
            ? {
                light: '#4f5b62',
                main: '#d5d5d5',
                dark: '#000a12',
                contrastText: '#ffffff'
              }
            : {
                light: '#4f5b62',
                main: '#263238',
                dark: '#000a12',
                contrastText: '#ffffff'
              },
          primary: {
            light: '#66ffa6',
            main: '#00e676',
            dark: '#00b248',
            contrastText: '#000000'
          }
        }
      }),
    [prefersDarkMode]
  )

  const classes = useStyles({ isMobile })

  const steps: SectionItem[] = drawerSectionsForYear(activeYear).flatMap(
    (section: Section) => section.items
  )

  const allItems: SectionItem[] = [...steps, ...backPages]

  const Layout = ({ children }: PropsWithChildren<{ children: ReactNode }>) => (
    <Grid
      ref={ref}
      component="main"
      tabIndex={-1}
      container
      justifyContent="center"
      direction="row"
    >
      <Grid item sm={12} md={8} lg={6}>
        {!isStartPage && (
          <Grid item className={classes.content}>
            {' '}
            <YearStatusBar />
          </Grid>
        )}
        <Grid item className={classes.content}>
          {children}
        </Grid>
      </Grid>
    </Grid>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SkipToLinks />
      {isMobile && !isStartPage && <div className={classes.toolbar} />}
      <div className={classes.container}>
        <StateLoader />
        <PagerProvider pages={steps}>
          <Switch>
            <Redirect path="/" to={Urls.default} exact />
            {allItems.map((item) => (
              <Route key={item.title} exact path={item.url}>
                {!isStartPage && <Menu />}
                <Layout>
                  {!isStartPage && <DataPropagator />}
                  {item.element}
                </Layout>
              </Route>
            ))}
            <Route>
              <Layout>
                <NoMatchPage />
              </Layout>
            </Route>
          </Switch>
        </PagerProvider>
        {!isMobile && <ScrollTop />}
      </div>
    </ThemeProvider>
  )
}

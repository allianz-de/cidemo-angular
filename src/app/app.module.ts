import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux/store'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule, Routes } from '@angular/router'

// Components
import { AppComponent } from './app.component'
import { HeaderComponent } from './header/header.component'
import { HomeComponent } from './home/home.component'
import { LoginComponent } from './login/login.component'
import { routes } from './routes'

// Services
import { AccountHistoryService, AuthenticationService } from './services'

// State
import { HistoryActions, SessionActions } from './actions'
import { IAppState, INITIAL_STATE, rootReducer } from './app.store'

// Misc.
import { AuthGuard } from './guards/auth.guard'

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgReduxModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    AccountHistoryService,
    AuthenticationService,
    AuthGuard,
    HistoryActions,
    SessionActions
  ],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule {
  constructor (
    ngRedux: NgRedux<IAppState>,
    devTools: DevToolsExtension) {

    const storeEnhancers = devTools.isEnabled() ?
      [ devTools.enhancer() ] :
      []

    ngRedux.configureStore(
      rootReducer,
      INITIAL_STATE,
      [],
      storeEnhancers)
  }
}

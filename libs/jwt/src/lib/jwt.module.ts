import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { JwtInjectorInterceptor, JwtRefreshInterceptor } from './interceptor';
import { DEFAULT_JWT_CONFIG } from './model';
import {
	DEFAULT_JWT_CONFIGURATION_TOKEN,
	JwtConfigurationProvider,
	JwtModuleConfigurationProvider,
	JWT_CONFIGURATION_TOKEN,
} from './token';

/**
 * Helps you define a JwtConfigurationProvider
 *
 * @internal
 */
export function createJwtConfigurationProvider<
	A = unknown,
	B = unknown,
	C = unknown,
	D = unknown,
	E = unknown
>(
	tokenConfigurationProvider: JwtModuleConfigurationProvider<A, B, C, D, E>
): JwtConfigurationProvider<A, B, C, D, E> {
	return {
		provide: JWT_CONFIGURATION_TOKEN,
		multi: false,
		...tokenConfigurationProvider,
	} as JwtConfigurationProvider<A, B, C, D, E>;
}

/**
 * This module needs to be configured to use. See the
 * {@link JwtModule#forRoot | forRoot} method for more information.
 *
 * TODO: The main configuration will probably have to be split up into multiple
 * tokens. So that other, plug in configration modules can provide them.
 * Like Ngrx and Local. They then transform their configs into this common one.
 */
@NgModule({
	imports: [CommonModule],
})
export class JwtModule {
	/**
	 * To define the interceptors and the token with the provided config.
	 *
	 * @example
	 *
	 * ```ts
	 * (a)NgModule({
	 *		imports: [
	 *			JwtModule.forRoot<Foo>({
	 *					useFactory: (foo) => foo.getConf(),
	 *					deps: [Foo] // if something has to be injected
	 *			})
	 *		]
	 *	})
	 *	export class CoreModule {}
	 * ```
	 * @param tokenProvider create with `createAuthTokenProvider` or
	 * 	`createRefreshableAuthTokenProvider`
	 */
	public static forRoot<A = unknown, B = unknown, C = unknown, D = unknown, E = unknown>(
		jwtModuleConfigurationProvider: JwtModuleConfigurationProvider<A, B, C, D, E>
	): ModuleWithProviders<JwtModule> {
		return {
			ngModule: JwtModule,
			providers: [
				{
					provide: HTTP_INTERCEPTORS,
					useClass: JwtInjectorInterceptor,
					multi: true,
				},
				{
					provide: HTTP_INTERCEPTORS,
					useClass: JwtRefreshInterceptor,
					multi: true,
				},
				{
					provide: DEFAULT_JWT_CONFIGURATION_TOKEN,
					useValue: DEFAULT_JWT_CONFIG,
				},
				createJwtConfigurationProvider<A, B, C, D, E>(jwtModuleConfigurationProvider),
			],
		};
	}
}

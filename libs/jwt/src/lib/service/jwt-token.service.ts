import { HttpHandler } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtCouldntRefreshError } from '../errors/jwt-error.class';
import { intoObservable } from '../function/into-observable.function';
import { isNotNullish } from '../function/is-not-nullish.predicate';
import { handleJwtError } from '../function/jwt-error-handler.function';
import { tryRefresh } from '../function/refresh-token.function';
import { isString } from '../function/string.predicate';
import {
	JwtConfiguration,
	JwtRefreshConfiguration,
} from '../model/auth-core-configuration.interface';
import { JwtToken } from '../model/jwt-token.class';
import {
	DEFAULT_JWT_CONFIGURATION_TOKEN,
	DEFAULT_JWT_REFRESH_CONFIGURATION_TOKEN,
	JWT_CONFIGURATION_TOKEN,
	JWT_REFRESH_CONFIGURATION_TOKEN,
} from '../token/jwt-configuration.token';

@Injectable({
	providedIn: 'root',
})
export class JwtTokenService<
	Claims = Record<string | number, unknown>,
	RefreshClaims = Record<string | number, unknown>,
	RefreshRequest = Record<string | number, unknown>,
	RefreshResponse = Record<string | number, unknown>
> {
	public readonly config: JwtConfiguration = {
		...this.rawDefaultConfig,
		...this.rawConfig,
	};

	public readonly refreshConfig?: JwtRefreshConfiguration<RefreshRequest, RefreshResponse> =
		this.rawDefaultRefreshConfig && this.rawRefreshConfig
			? {
					...this.rawDefaultRefreshConfig,
					...this.rawRefreshConfig,
			  }
			: undefined;

	/**
	 * Consider restricting getToken to observables only so things can be cached
	 */
	public readonly rawAccessToken$ = intoObservable(this.config.getToken);

	public readonly rawRefreshToken$ =
		this.refreshConfig && this.refreshConfig.getRefreshToken
			? intoObservable(this.refreshConfig.getRefreshToken)
			: of(null);

	public readonly accessToken$ = this.rawAccessToken$.pipe(
		map((token) => {
			if (isString(token)) {
				const jwtToken = JwtToken.from<Claims>(token);
				if (!jwtToken) throw new Error('Non-valid token observed');
				else return jwtToken;
			} else return null;
		})
	);

	public readonly refreshToken$ = this.rawRefreshToken$.pipe(
		map((refreshToken) => {
			if (isString(refreshToken)) {
				const jwtToken = JwtToken.from<RefreshClaims>(refreshToken);
				if (!jwtToken) throw new Error('Non-valid token observed');
				else return jwtToken;
			} else return null;
		})
	);

	public readonly accessTokenHeader$ = this.accessToken$.pipe(
		map((token) => (token && token.header) || null)
	);

	public readonly accessTokenPayload$ = this.accessToken$.pipe(
		map((token) => (token && token.payload) || null)
	);

	public readonly refreshTokenHeader$ = this.refreshToken$.pipe(
		map((token) => (token && token.header) || null)
	);

	public readonly refreshTokenPayload$ = this.refreshToken$.pipe(
		map((token) => (token && token.payload) || null)
	);

	/**
	 * TODO: Emit when expires
	 */
	public readonly isAccessTokenExpired$ = this.accessToken$.pipe(
		map((token) => token && token.isExpired())
	);

	/**
	 * TODO: Emit when expires
	 */
	public readonly isRefreshTokenExpired$ = this.refreshToken$.pipe(
		map((token) => token && token.isExpired())
	);

	public readonly isAccessTokenValid$ = this.isAccessTokenExpired$.pipe(
		map((isExpired) => isNotNullish(isExpired) && !isExpired)
	);

	public readonly isRefreshTokenValid$ = this.isRefreshTokenExpired$.pipe(
		map((isExpired) => isNotNullish(isExpired) && !isExpired)
	);

	public constructor(
		private readonly httpHandler: HttpHandler,
		@Inject(JWT_CONFIGURATION_TOKEN)
		private readonly rawConfig: JwtConfiguration,
		@Inject(DEFAULT_JWT_CONFIGURATION_TOKEN)
		private readonly rawDefaultConfig: JwtConfiguration,
		@Inject(DEFAULT_JWT_REFRESH_CONFIGURATION_TOKEN)
		@Optional()
		private readonly rawDefaultRefreshConfig?: JwtRefreshConfiguration<
			RefreshRequest,
			RefreshResponse
		>,
		@Inject(JWT_REFRESH_CONFIGURATION_TOKEN)
		@Optional()
		private readonly rawRefreshConfig?: JwtRefreshConfiguration<
			RefreshRequest,
			RefreshResponse
		>,
		@Optional() private readonly router?: Router
	) {}

	/**
	 * Does a token refresh. Emits false if it failed, or true if succeeded.
	 */
	public manualRefresh(): Observable<boolean> {
		if (this.refreshConfig) {
			return tryRefresh(
				this.httpHandler,
				'Access token not valid on guard activation',
				this.refreshConfig,
				(refreshError) =>
					handleJwtError<RefreshRequest, RefreshResponse>(
						JwtCouldntRefreshError.createErrorResponse(undefined, refreshError),
						this.config,
						this.refreshConfig,
						this.router
					).pipe(catchError(() => of(false))),
				() => of(true)
			);
		} else {
			return of(false);
		}
	}
}

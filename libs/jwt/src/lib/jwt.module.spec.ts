import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { JwtInjectorInterceptor, JwtRefreshInterceptor } from './interceptor';
import { JwtModule } from './jwt.module';
import { JWT_CONFIGURATION_TOKEN, JWT_REFRESH_CONFIGURATION_TOKEN } from './token';

describe('JwtModule', () => {
	it('should create without refresh config', () => {
		TestBed.configureTestingModule({
			imports: [JwtModule.forRoot({ useValue: {} })],
		}).compileComponents();
		expect(JwtModule).toBeDefined();
		const jwtConfig = TestBed.inject(JWT_CONFIGURATION_TOKEN);
		expect(jwtConfig).toBeTruthy();
		const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
		const jwtInterceptor = interceptors.find((i) => i instanceof JwtInjectorInterceptor);
		expect(jwtInterceptor).toBeTruthy();
		const jwtRefreshInterceptor = interceptors.find((i) => i instanceof JwtRefreshInterceptor);
		expect(jwtRefreshInterceptor).toBeFalsy();
		expect(() => TestBed.inject(JWT_REFRESH_CONFIGURATION_TOKEN)).toThrow();
	});

	it('should create with refresh config', () => {
		TestBed.configureTestingModule({
			imports: [JwtModule.forRoot({ useValue: {} }, { useValue: {} })],
		}).compileComponents();
		expect(JwtModule).toBeDefined();
		const jwtConfig = TestBed.inject(JWT_CONFIGURATION_TOKEN);
		expect(jwtConfig).toBeTruthy();
		const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
		const jwtInterceptor = interceptors.find((i) => i instanceof JwtInjectorInterceptor);
		expect(jwtInterceptor).toBeTruthy();
		const jwtRefreshInterceptor = interceptors.find((i) => i instanceof JwtRefreshInterceptor);
		expect(jwtRefreshInterceptor).toBeTruthy();
		const refreshConfig = TestBed.inject(JWT_REFRESH_CONFIGURATION_TOKEN);
		expect(refreshConfig).toBeTruthy();
	});

	afterEach(() => {
		TestBed.resetTestingModule();
	});
});

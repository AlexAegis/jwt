import { UrlFilter } from '../model';
import { matchAgainst } from './match-against.function';
import { SeparatedUrl } from './separate-url.function';

/**
 * Matches the filter against a separated url. Non-existend rulesets
 * automatically pass. **Empty whitelist rulesets never pass.** Empty blacklist
 * rulesets always pass.
 */
export function checkAgainstUrlFilter(
	urlFilter: UrlFilter,
	{ domain, path, protocol }: SeparatedUrl
): boolean {
	const protocolMatcher = matchAgainst(protocol);
	const domainMatcher = matchAgainst(domain);
	const pathMatcher = matchAgainst(path);

	const protocolWhitelistRulesPass = urlFilter.protocolWhitelist?.some(protocolMatcher) ?? true;

	const protocolBlacklistRulesPass = !urlFilter.protocolBlacklist?.some(protocolMatcher) ?? true;

	const domainWhitelistRulesPass = urlFilter.domainWhitelist?.some(domainMatcher) ?? true;

	const domainBlacklistRulesPass = !urlFilter.domainBlacklist?.some(domainMatcher) ?? true;

	const pathWhitelistRulesPass = urlFilter.pathWhitelist?.some(pathMatcher) ?? true;

	const pathBlacklistRulesPass = !urlFilter.pathBlacklist?.some(pathMatcher) ?? true;

	return (
		protocolWhitelistRulesPass &&
		protocolBlacklistRulesPass &&
		domainWhitelistRulesPass &&
		domainBlacklistRulesPass &&
		pathWhitelistRulesPass &&
		pathBlacklistRulesPass
	);
}

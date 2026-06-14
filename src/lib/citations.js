/**
 * Citation formatting engine
 * Supports APA, IEEE, MLA, Chicago, Harvard styles
 */

export function formatCitation(citation, style = 'apa') {
  const formatters = {
    apa: formatAPA,
    ieee: formatIEEE,
    mla: formatMLA,
    chicago: formatChicago,
    harvard: formatHarvard,
  };

  const formatter = formatters[style.toLowerCase()];
  if (!formatter) return formatAPA(citation);
  return formatter(citation);
}

function formatAuthors(authors, style) {
  if (!authors || !authors.length) return 'Unknown Author';

  switch (style) {
    case 'apa': {
      if (authors.length === 1) return formatAuthorLastFirst(authors[0]);
      if (authors.length === 2)
        return `${formatAuthorLastFirst(authors[0])}, & ${formatAuthorLastFirst(authors[1])}`;
      if (authors.length <= 20)
        return (
          authors
            .slice(0, -1)
            .map(formatAuthorLastFirst)
            .join(', ') +
          ', & ' +
          formatAuthorLastFirst(authors[authors.length - 1])
        );
      return (
        authors
          .slice(0, 19)
          .map(formatAuthorLastFirst)
          .join(', ') +
        ', ... ' +
        formatAuthorLastFirst(authors[authors.length - 1])
      );
    }
    case 'ieee': {
      return authors
        .map((a) => {
          const parts = a.trim().split(' ');
          if (parts.length === 1) return parts[0];
          const last = parts.pop();
          return parts.map((p) => p[0] + '.').join(' ') + ' ' + last;
        })
        .join(', ');
    }
    case 'mla': {
      if (authors.length === 1) return formatAuthorLastFirst(authors[0]);
      if (authors.length === 2)
        return `${formatAuthorLastFirst(authors[0])}, and ${authors[1]}`;
      return `${formatAuthorLastFirst(authors[0])}, et al.`;
    }
    case 'chicago': {
      if (authors.length === 1) return formatAuthorLastFirst(authors[0]);
      if (authors.length <= 3)
        return (
          authors
            .slice(0, -1)
            .map((a, i) => (i === 0 ? formatAuthorLastFirst(a) : a))
            .join(', ') +
          ', and ' +
          authors[authors.length - 1]
        );
      return `${formatAuthorLastFirst(authors[0])}, et al.`;
    }
    case 'harvard': {
      if (authors.length === 1) return formatAuthorLastFirst(authors[0]);
      if (authors.length === 2)
        return `${formatAuthorLastFirst(authors[0])} and ${formatAuthorLastFirst(authors[1])}`;
      if (authors.length <= 3)
        return (
          authors
            .slice(0, -1)
            .map(formatAuthorLastFirst)
            .join(', ') +
          ' and ' +
          formatAuthorLastFirst(authors[authors.length - 1])
        );
      return `${formatAuthorLastFirst(authors[0])} et al.`;
    }
    default:
      return authors.join(', ');
  }
}

function formatAuthorLastFirst(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const last = parts.pop();
  const initials = parts.map((p) => p[0] + '.').join(' ');
  return `${last}, ${initials}`;
}

function formatAPA(c) {
  const authors = formatAuthors(c.authors, 'apa');
  const year = c.year ? ` (${c.year}).` : ' (n.d.).';
  const title = c.title ? ` ${c.title}.` : '';
  const journal = c.journal ? ` *${c.journal}*` : '';
  const volume = c.volume ? `, *${c.volume}*` : '';
  const issue = c.issue ? `(${c.issue})` : '';
  const pages = c.pages ? `, ${c.pages}` : '';
  const doi = c.doi ? ` https://doi.org/${c.doi}` : '';

  return `${authors}${year}${title}${journal}${volume}${issue}${pages}.${doi}`;
}

function formatIEEE(c) {
  const authors = formatAuthors(c.authors, 'ieee');
  const title = c.title ? ` "${c.title},"` : '';
  const journal = c.journal ? ` *${c.journal}*` : '';
  const volume = c.volume ? `, vol. ${c.volume}` : '';
  const issue = c.issue ? `, no. ${c.issue}` : '';
  const pages = c.pages ? `, pp. ${c.pages}` : '';
  const year = c.year ? `, ${c.year}` : '';
  const doi = c.doi ? `. doi: ${c.doi}` : '';

  return `${authors},${title}${journal}${volume}${issue}${pages}${year}${doi}.`;
}

function formatMLA(c) {
  const authors = formatAuthors(c.authors, 'mla');
  const title = c.title ? ` "${c.title}."` : '';
  const journal = c.journal ? ` *${c.journal}*` : '';
  const volume = c.volume ? `, vol. ${c.volume}` : '';
  const issue = c.issue ? `, no. ${c.issue}` : '';
  const year = c.year ? `, ${c.year}` : '';
  const pages = c.pages ? `, pp. ${c.pages}` : '';
  const doi = c.doi ? `. doi:${c.doi}` : '';

  return `${authors}.${title}${journal}${volume}${issue}${year}${pages}${doi}.`;
}

function formatChicago(c) {
  const authors = formatAuthors(c.authors, 'chicago');
  const title = c.title ? ` "${c.title}."` : '';
  const journal = c.journal ? ` *${c.journal}*` : '';
  const volume = c.volume ? ` ${c.volume}` : '';
  const issue = c.issue ? `, no. ${c.issue}` : '';
  const year = c.year ? ` (${c.year})` : '';
  const pages = c.pages ? `: ${c.pages}` : '';
  const doi = c.doi ? `. https://doi.org/${c.doi}` : '';

  return `${authors}.${title}${journal}${volume}${issue}${year}${pages}${doi}.`;
}

function formatHarvard(c) {
  const authors = formatAuthors(c.authors, 'harvard');
  const year = c.year ? ` (${c.year})` : ' (n.d.)';
  const title = c.title ? ` '${c.title}',` : '';
  const journal = c.journal ? ` *${c.journal}*` : '';
  const volume = c.volume ? `, ${c.volume}` : '';
  const issue = c.issue ? `(${c.issue})` : '';
  const pages = c.pages ? `, pp. ${c.pages}` : '';
  const doi = c.doi ? `. doi: ${c.doi}` : '';

  return `${authors}${year}${title}${journal}${volume}${issue}${pages}${doi}.`;
}

export function formatInTextCitation(citation, style = 'apa') {
  const firstAuthor = citation.authors?.[0]
    ? citation.authors[0].split(' ').pop()
    : 'Unknown';
  const year = citation.year || 'n.d.';

  switch (style) {
    case 'apa':
      return citation.authors?.length > 2
        ? `(${firstAuthor} et al., ${year})`
        : citation.authors?.length === 2
          ? `(${firstAuthor} & ${citation.authors[1].split(' ').pop()}, ${year})`
          : `(${firstAuthor}, ${year})`;
    case 'ieee':
      return `[${citation._index || '?'}]`;
    case 'mla':
      return `(${firstAuthor} ${citation.pages || ''})`.trim() + ')';
    case 'chicago':
      return `(${firstAuthor} ${year})`;
    case 'harvard':
      return `(${firstAuthor}, ${year})`;
    default:
      return `(${firstAuthor}, ${year})`;
  }
}

export const CITATION_STYLES = [
  { value: 'apa', label: 'APA 7th Edition' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'mla', label: 'MLA 9th Edition' },
  { value: 'chicago', label: 'Chicago 17th Edition' },
  { value: 'harvard', label: 'Harvard' },
];

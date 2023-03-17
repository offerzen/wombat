export const deferWebflowJs = ({ html, cdnUrl }) => {
  // https://regexr.com/6pbl8
  const pattern = new RegExp(`<script([a-z=\/ "]+src="${cdnUrl.replace(/\./g, '\\.')}[a-z0-9.\\-_~!$&()*+;=:@% /]+\\.(js)"[a-z=\/ "]+>)`, 'gi');

  // Add defer at start
  return html.replace(pattern, '<script defer $1');
}

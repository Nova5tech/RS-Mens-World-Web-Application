/**
 * RS Mens World Standalone Web Chat Widget Embed Script
 * Usage:
 * <script 
 *   src="https://cdn.rsmensworld.com/widget/rs-chat.js" 
 *   data-api="https://api.rsmensworld.com" 
 *   data-branch="branch_1" 
 *   data-color="#0F4C3A"
 *   async>
 * </script>
 */

(function () {
  const currentScript = document.currentScript as HTMLScriptElement;
  const apiBase = currentScript?.getAttribute('data-api') || 'https://api.rsmensworld.com';
  const defaultBranch = currentScript?.getAttribute('data-branch') || 'branch_1';
  const brandColor = currentScript?.getAttribute('data-color') || '#0F4C3A';

  // Create iframe or web component container
  const container = document.createElement('div');
  container.id = 'rs-mens-world-chat-widget';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';

  // Floating trigger button
  const button = document.createElement('button');
  button.innerHTML = `
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#46D68C;margin-right:8px;"></span>
    <span style="font-weight:700;font-size:13px;">Chat with Store</span>
  `;
  button.style.backgroundColor = brandColor;
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.borderRadius = '30px';
  button.style.padding = '12px 20px';
  button.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';

  container.appendChild(button);
  document.body.appendChild(container);

  button.addEventListener('click', () => {
    alert(`RS Mens World Live Chat Assistant connected to ${defaultBranch}. For full features, visit the web application.`);
  });
})();

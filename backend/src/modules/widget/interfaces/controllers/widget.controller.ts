import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Res,
  NotFoundException,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { WidgetRepository } from '../../infrastructure/repositories/widget.repository';

/* ─── Admin endpoints (authenticated) ─── */

@Controller('widget')
export class WidgetAdminController {
  constructor(private readonly repo: WidgetRepository) {}

  @Get('config')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async getConfig(@CurrentUser('orgId') orgId: string) {
    const config = await this.repo.findByOrgId(orgId);
    return config ?? { enabled: false };
  }

  @Put('config')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async updateConfig(
    @CurrentUser('orgId') orgId: string,
    @Body() dto: {
      enabled?: boolean;
      position?: string;
      primaryColor?: string;
      welcomeMessage?: string;
      placeholder?: string;
      companyName?: string;
      avatarUrl?: string;
      whatsappNumber?: string;
    },
  ) {
    return this.repo.upsert(orgId, dto);
  }
}

/* ─── Public endpoints (no auth, CORS: *) ─── */

@Controller('widgets')
@Public()
export class WidgetPublicController {
  constructor(private readonly repo: WidgetRepository) {}

  /**
   * Public endpoint: returns widget config for embedding.
   * Called by the widget script from customer websites.
   */
  @Get(':orgSlug/config')
  async getPublicConfig(
    @Param('orgSlug') orgSlug: string,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=60');

    const config = await this.repo.findByOrgSlug(orgSlug);
    if (!config || !config.enabled) {
      return res.status(404).json({ error: 'Widget not found or disabled' });
    }

    return res.json({
      orgSlug: config.orgSlug,
      companyName: config.companyName || config.orgName,
      position: config.position,
      primaryColor: config.primaryColor,
      welcomeMessage: config.welcomeMessage,
      placeholder: config.placeholder,
      avatarUrl: config.avatarUrl,
      whatsappNumber: config.whatsappNumber,
    });
  }

  /**
   * Public endpoint: serves the embeddable widget JavaScript.
   */
  @Get(':orgSlug/embed.js')
  async getScript(
    @Param('orgSlug') orgSlug: string,
    @Res() res: Response,
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Inline widget script — self-contained, no dependencies
    const script = generateWidgetScript(orgSlug);
    return res.send(script);
  }
}

/**
 * Generates a self-contained widget JS snippet.
 * This creates a floating chat button that either:
 * 1. Opens WhatsApp click-to-chat (if whatsappNumber is configured)
 * 2. Shows an inline chat bubble with welcome message
 */
function generateWidgetScript(orgSlug: string): string {
  // Sanitize slug to only allow safe characters before embedding in JS string
  const safeSlug = orgSlug.replace(/[^a-z0-9-]/g, '');
  orgSlug = safeSlug;
  return `
(function() {
  if (window.__crmwa_widget_loaded) return;
  window.__crmwa_widget_loaded = true;

  var API_BASE = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src).origin + '/api/v1'
    : '';

  function init() {
    fetch(API_BASE + '/widgets/' + encodeURIComponent('${orgSlug}') + '/config')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(cfg) { if (cfg) render(cfg); })
      .catch(function() {});
  }

  function render(cfg) {
    var pos = cfg.position || 'bottom-right';
    var isRight = pos.indexOf('right') >= 0;
    var color = /^#[0-9A-Fa-f]{3,6}$/.test(cfg.primaryColor) ? cfg.primaryColor : '#6366f1';

    // Container
    var container = document.createElement('div');
    container.id = 'crmwa-widget';
    container.style.cssText = 'position:fixed;z-index:999999;' +
      (isRight ? 'right:20px;' : 'left:20px;') + 'bottom:20px;font-family:system-ui,sans-serif;';

    // Chat popup
    var popup = document.createElement('div');
    popup.style.cssText = 'display:none;width:320px;max-height:400px;background:#fff;border-radius:16px;' +
      'box-shadow:0 8px 30px rgba(0,0,0,0.12);margin-bottom:12px;overflow:hidden;';
    popup.innerHTML =
      '<div style="background:' + color + ';color:#fff;padding:16px 20px;">' +
        '<div style="font-size:15px;font-weight:600;">' + esc(cfg.companyName || 'Chat') + '</div>' +
        '<div style="font-size:13px;opacity:0.85;margin-top:4px;">' + esc(cfg.welcomeMessage) + '</div>' +
      '</div>' +
      '<div style="padding:16px 20px;">' +
        (cfg.whatsappNumber
          ? '<a href="https://wa.me/' + cfg.whatsappNumber.replace(/[^0-9]/g,'') +
            '?text=' + encodeURIComponent(cfg.welcomeMessage || 'Hi!') +
            '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;' +
            'background:#25D366;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:500;">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.476A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.115 0-4.142-.659-5.853-1.903l-.42-.298-2.744.877.877-2.622-.326-.448A9.71 9.71 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>' +
            'Chat on WhatsApp</a>'
          : '<p style="font-size:13px;color:#666;text-align:center;">Send us a message!</p>'
        ) +
      '</div>';

    // Toggle button
    var btn = document.createElement('button');
    btn.style.cssText = 'width:56px;height:56px;border-radius:50%;background:' + color +
      ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s;' +
      (isRight ? 'margin-left:auto;' : '');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };

    var open = false;
    btn.onclick = function() {
      open = !open;
      popup.style.display = open ? 'block' : 'none';
      btn.innerHTML = open
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
    };

    container.appendChild(popup);
    container.appendChild(btn);
    document.body.appendChild(container);
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
}

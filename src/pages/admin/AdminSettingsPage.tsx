import { useState } from 'react';
import {
  Wrench, Bell, Shield, Database, Users, Save,
  RefreshCw, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import { useAdminStore } from '@/store/adminStore';

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled = false }: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-checked={enabled}
      role="switch"
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]/50',
        enabled ? 'bg-[#00FF88]' : 'bg-[#2a2a2a]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}>
      <span className={cn(
        'absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200',
        enabled ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#1a1a1a] bg-[#111]">
        <Icon className="h-3.5 w-3.5 text-[#00FF88]" />
        <span className="text-xs font-bold text-[#888] uppercase tracking-widest">{title}</span>
      </div>
      <div className="divide-y divide-[#111]">{children}</div>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, enabled, onChange, disabled, danger }: {
  label: string;
  desc: string;
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-[#111]/50 transition-colors">
      <div className="flex-1 min-w-0 pr-6">
        <p className={cn('text-sm font-medium', danger ? 'text-red-400' : 'text-white')}>{label}</p>
        <p className="text-xs text-[#555] mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast();
  const { adminUser } = useAdminStore();

  const [flags, setFlags] = useState({
    maintenanceMode:    false,
    registrationOpen:   true,
    emailNotifications: true,
    foundersDesk:       true,
    hallOfFame:         true,
    productJourney:     true,
    discussionsEnabled: true,
    showcaseEnabled:    true,
    bugsEnabled:        true,
    featuresEnabled:    true,
  });

  const [community, setCommunity] = useState({
    name:        'A5X Community',
    description: 'The premium community for A5X product enthusiasts',
    supportEmail:'support@a5x.community',
    maxPostLen:  '50000',
    maxBioLen:   '300',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof flags) => {
    if (key === 'maintenanceMode' && !flags.maintenanceMode) {
      if (!window.confirm('Enabling maintenance mode will show a maintenance page to all users. Continue?')) return;
    }
    setFlags(f => ({ ...f, [key]: !f[key] }));
  };

  const handleSaveCommunity = async () => {
    setSaving(true);
    // In production: POST /api/v1/admin/settings
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    success('Settings saved successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'founder' || adminUser?.role === 'co_founder';

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-[#666] mt-0.5">Configure platform behavior and feature flags</p>
      </div>

      {/* Maintenance warning banner */}
      {flags.maintenanceMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-orange-400/30 bg-orange-400/5">
          <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-400">Maintenance Mode is ON</p>
            <p className="text-xs text-[#666]">Regular users see a maintenance page. Admin panel still accessible.</p>
          </div>
        </div>
      )}

      {/* Platform Flags */}
      <Section icon={Wrench} title="Platform Flags">
        <ToggleRow
          label="Maintenance Mode"
          desc="Show maintenance page to all non-admin users"
          enabled={flags.maintenanceMode}
          onChange={() => toggle('maintenanceMode')}
          danger
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Open Registration"
          desc="Allow new users to create accounts"
          enabled={flags.registrationOpen}
          onChange={() => toggle('registrationOpen')}
          disabled={!isAdmin}
        />
      </Section>

      {/* Feature Visibility */}
      <Section icon={Shield} title="Feature Visibility">
        <ToggleRow
          label="Discussions"
          desc="Show the discussions / posts section"
          enabled={flags.discussionsEnabled}
          onChange={() => toggle('discussionsEnabled')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Showcase"
          desc="Show the project showcase section"
          enabled={flags.showcaseEnabled}
          onChange={() => toggle('showcaseEnabled')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Bug Reports"
          desc="Allow users to submit bug reports"
          enabled={flags.bugsEnabled}
          onChange={() => toggle('bugsEnabled')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Feature Requests"
          desc="Allow users to submit feature requests"
          enabled={flags.featuresEnabled}
          onChange={() => toggle('featuresEnabled')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Founder's Desk"
          desc="Show product updates from the founder"
          enabled={flags.foundersDesk}
          onChange={() => toggle('foundersDesk')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Hall of Fame"
          desc="Show the reputation leaderboard"
          enabled={flags.hallOfFame}
          onChange={() => toggle('hallOfFame')}
          disabled={!isAdmin}
        />
        <ToggleRow
          label="Product Journey"
          desc="Show product roadmap and timeline"
          enabled={flags.productJourney}
          onChange={() => toggle('productJourney')}
          disabled={!isAdmin}
        />
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <ToggleRow
          label="Email Notifications"
          desc="Send email notifications to users for activity"
          enabled={flags.emailNotifications}
          onChange={() => toggle('emailNotifications')}
          disabled={!isAdmin}
        />
      </Section>

      {/* Community Info */}
      <Section icon={Users} title="Community Info">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Community Name</label>
              <Input
                value={community.name}
                onChange={e => setCommunity(c => ({ ...c, name: e.target.value }))}
                disabled={!isAdmin}
                className="bg-[#111] border-[#1a1a1a] text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Support Email</label>
              <Input
                value={community.supportEmail}
                onChange={e => setCommunity(c => ({ ...c, supportEmail: e.target.value }))}
                disabled={!isAdmin}
                className="bg-[#111] border-[#1a1a1a] text-white disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Description</label>
            <Input
              value={community.description}
              onChange={e => setCommunity(c => ({ ...c, description: e.target.value }))}
              disabled={!isAdmin}
              className="bg-[#111] border-[#1a1a1a] text-white disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Max Post Length</label>
              <Input
                value={community.maxPostLen}
                onChange={e => setCommunity(c => ({ ...c, maxPostLen: e.target.value }))}
                type="number"
                disabled={!isAdmin}
                className="bg-[#111] border-[#1a1a1a] text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Max Bio Length</label>
              <Input
                value={community.maxBioLen}
                onChange={e => setCommunity(c => ({ ...c, maxBioLen: e.target.value }))}
                type="number"
                disabled={!isAdmin}
                className="bg-[#111] border-[#1a1a1a] text-white disabled:opacity-50"
              />
            </div>
          </div>

          {!isAdmin && (
            <p className="text-xs text-[#555] flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Admin role required to change settings.
            </p>
          )}

          {isAdmin && (
            <div className="flex items-center gap-3 pt-1">
              <Button
                size="sm"
                onClick={handleSaveCommunity}
                disabled={saving}
                className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5">
                {saving
                  ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                  : saved
                    ? <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
                    : <><Save className="h-3.5 w-3.5" /> Save Changes</>
                }
              </Button>
              {saved && <p className="text-xs text-[#00FF88]">Changes saved successfully</p>}
            </div>
          )}
        </div>
      </Section>

      {/* Danger Zone */}
      {isAdmin && (
        <Section icon={AlertTriangle} title="Danger Zone">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-400/20 bg-red-400/5">
              <div>
                <p className="text-sm font-medium text-red-400">Clear All Notifications</p>
                <p className="text-xs text-[#555] mt-0.5">Permanently delete all notifications for all users</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm('This will delete ALL notifications. This cannot be undone.')) {
                    toastError('Not implemented — add backend endpoint');
                  }
                }}
                className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50">
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-400/20 bg-red-400/5">
              <div>
                <p className="text-sm font-medium text-red-400">Reset Feature Flags</p>
                <p className="text-xs text-[#555] mt-0.5">Reset all feature flags to their default values</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm('Reset all flags to defaults?')) {
                    setFlags({
                      maintenanceMode: false, registrationOpen: true, emailNotifications: true,
                      foundersDesk: true, hallOfFame: true, productJourney: true,
                      discussionsEnabled: true, showcaseEnabled: true, bugsEnabled: true, featuresEnabled: true,
                    });
                    success('Flags reset to defaults');
                  }
                }}
                className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50">
                Reset
              </Button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

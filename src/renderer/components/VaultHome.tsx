import { useEffect, useState, type FormEvent } from 'react';
import type { PasswordEntry, PasswordEntryInput } from '../../shared/types';
import { useLocale } from '../i18n/LocaleContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const emptyForm: PasswordEntryInput = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
};

interface VaultHomeProps {
  onLock: () => void;
}

export function VaultHome({ onLock }: VaultHomeProps) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [form, setForm] = useState<PasswordEntryInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [revealedId, setRevealedId] = useState<string | null>(null);

  async function refresh() {
    const list = await window.vault.entries.list();
    setEntries(list);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await window.vault.entries.update(editingId, form);
      } else {
        await window.vault.entries.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.saveFailed'));
    }
  }

  async function handleDelete(id: string) {
    await window.vault.entries.delete(id);
    await refresh();
  }

  function startEdit(entry: PasswordEntry) {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      username: entry.username,
      password: entry.password,
      url: entry.url,
      notes: entry.notes,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('home.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await window.vault.auth.lock();
            onLock();
          }}
        >
          {t('home.lock')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('home.entries')}</CardTitle>
            <CardDescription>{t('home.entryCount', { count: entries.length })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('home.empty')}</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-sm text-muted-foreground">{entry.username}</p>
                      <p className="mt-1 font-mono text-sm">
                        {revealedId === entry.id ? entry.password : '••••••••'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => setRevealedId(revealedId === entry.id ? null : entry.id)}
                      >
                        {revealedId === entry.id ? t('home.hide') : t('home.show')}
                      </Button>
                      <Button variant="ghost" className="h-8 px-2" onClick={() => startEdit(entry)}>
                        {t('home.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-destructive"
                        onClick={() => void handleDelete(entry.id)}
                      >
                        {t('home.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t('home.editEntry') : t('home.newEntry')}</CardTitle>
            <CardDescription>{t('home.formHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                placeholder={t('home.field.title')}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Input
                placeholder={t('home.field.username')}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <Input
                placeholder={t('home.field.password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Input
                placeholder={t('home.field.url')}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <Input
                placeholder={t('home.field.notes')}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex gap-2">
                <Button type="submit">{editingId ? t('home.update') : t('home.create')}</Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

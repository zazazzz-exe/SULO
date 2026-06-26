import { useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { useSettings } from '@/services/settingsService';
import { useTheme } from '@/theme';
import { layout, radii, space } from '@/theme/tokens';
import type { Language, ReadingLevel, TextSize } from '@/services/types';

/* ------------------------------ Building blocks ------------------------ */

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        {hint ? (
          <Text variant="small" color="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelFor?: (v: T) => string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: space.xs,
        backgroundColor: theme.colors.paper,
        padding: space.xs,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={labelFor ? labelFor(opt) : opt}
            onPress={() => onChange(opt)}
            style={{
              flexGrow: 1,
              minHeight: 40,
              paddingVertical: space.sm,
              paddingHorizontal: space.md,
              borderRadius: radii.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? theme.colors.flame : 'transparent',
            }}
          >
            <Text variant="small" style={{ color: active ? '#FFFFFF' : theme.colors.ink }}>
              {labelFor ? labelFor(opt) : opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RadioList<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelFor: (v: T) => string;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={labelFor(opt)}
            onPress={() => onChange(opt)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
              minHeight: layout.minTouchTarget,
              paddingHorizontal: space.md,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: active ? theme.colors.flame : theme.colors.hairline,
              backgroundColor: active ? theme.colors.flameSoft : theme.colors.card,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: active ? theme.colors.flame : theme.colors.hairline,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {active ? <Check size={12} color={theme.colors.flameDeep} /> : null}
            </View>
            <Text variant="body" style={{ flex: 1 }}>
              {labelFor(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  title,
  hint,
  value,
  onValueChange,
}: {
  title: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: layout.minTouchTarget,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        {hint ? (
          <Text variant="small" color="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={title}
        trackColor={{ true: theme.colors.flame, false: theme.colors.hairline }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

/* --------------------------------- Screen ------------------------------ */

const LANGUAGES: Language[] = ['EN', 'FIL', 'CEB'];
const LEVELS: ReadingLevel[] = ['CHILD', 'STUDENT', 'ADULT', 'SENIOR'];
const TEXT_SIZES: TextSize[] = ['SMALL', 'DEFAULT', 'LARGE', 'XLARGE'];
const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function Settings() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, update, reset } = useSettings();
  const { t } = useT();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.paper, paddingTop: insets.top }}>
      {/* Modal header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: space.lg,
          height: layout.headerHeight,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.hairline,
        }}
      >
        <Text variant="h2">{t('settings.title')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.close')}
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: layout.minTouchTarget,
            height: layout.minTouchTarget,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} color={theme.colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: space.xl }}>
        <Container maxWidth={620}>
          <View style={{ gap: space.xl }}>
            <Surface pad="lg" radius="lg" style={{ gap: space.xl }}>
              <Row title={t('settings.language')} hint={t('settings.language.hint')}>
                <Segmented
                  options={LANGUAGES}
                  value={settings.language}
                  onChange={(v) => update({ language: v })}
                  labelFor={(v) => t(`lang.${v}`)}
                />
              </Row>

              <Row
                title={t('settings.readingLevel')}
                hint={t('settings.readingLevel.hint')}
              >
                <RadioList
                  options={LEVELS}
                  value={settings.readingLevel}
                  onChange={(v) => update({ readingLevel: v })}
                  labelFor={(v) => t(`read.${v}`)}
                />
              </Row>
            </Surface>

            <Surface pad="lg" radius="lg" style={{ gap: space.xl }}>
              <ToggleRow
                title={t('settings.voice')}
                hint={t('settings.voice.hint')}
                value={settings.voiceEnabled}
                onValueChange={(v) => update({ voiceEnabled: v })}
              />
              {settings.voiceEnabled ? (
                <Row title={t('settings.voiceSpeed')}>
                  <Segmented
                    options={SPEEDS.map(String)}
                    value={String(settings.voiceSpeed)}
                    onChange={(v) => update({ voiceSpeed: Number(v) })}
                    labelFor={(v) => `${v}×`}
                  />
                </Row>
              ) : null}
              <ToggleRow
                title={t('settings.voiceDemo')}
                hint={t('settings.voiceDemo.hint')}
                value={settings.voiceDemoMode}
                onValueChange={(v) => update({ voiceDemoMode: v })}
              />
            </Surface>

            <Surface pad="lg" radius="lg" style={{ gap: space.xl }}>
              <Row title={t('settings.textSize')} hint={t('settings.textSize.hint')}>
                <Segmented
                  options={TEXT_SIZES}
                  value={settings.textSize}
                  onChange={(v) => update({ textSize: v })}
                  labelFor={(v) => t(`size.${v}`)}
                />
              </Row>
              <ToggleRow
                title={t('settings.contrast')}
                hint={t('settings.contrast.hint')}
                value={settings.highContrast}
                onValueChange={(v) => update({ highContrast: v })}
              />
              <ToggleRow
                title={t('settings.reduceMotion')}
                hint={t('settings.reduceMotion.hint')}
                value={settings.reduceMotion}
                onValueChange={(v) => update({ reduceMotion: v })}
              />
              {Platform.OS === 'web' ? (
                <ToggleRow
                  title={t('settings.torchCursor')}
                  hint={t('settings.torchCursor.hint')}
                  value={settings.torchCursor}
                  onValueChange={(v) => update({ torchCursor: v })}
                />
              ) : null}
            </Surface>

            <Button label={t('settings.reset')} variant="secondary" onPress={reset} />

            <Text variant="small" color="muted" center>
              {t('settings.saved')}
            </Text>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

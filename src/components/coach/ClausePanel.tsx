import { X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, RiskBadge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { useReducedMotionPref } from '@/hooks/useReducedMotion';
import { useResponsive } from '@/hooks/useResponsive';
import { useT } from '@/i18n';
import { useTheme } from '@/theme';
import { layout, motion, radii, space, webShadow } from '@/theme/tokens';
import type { Clause, RiskFlag } from '@/services/types';

import { CitedBasis } from './CitedBasis';

export type ClausePanelState = { clause: Clause; flag?: RiskFlag } | null;

/**
 * The clause detail surface. On web/tablet it slides in from the right as a
 * docked panel; on mobile it rises as a custom bottom sheet (no third-party
 * sheet lib — those are flaky on web). Shows the original text, the plain
 * rewrite, the risk, and the citation.
 */
export function ClausePanel({
  state,
  onClose,
}: {
  state: ClausePanelState;
  onClose: () => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotionPref();
  const { isWide } = useResponsive();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const open = state != null;

  const Body = state ? (
    <ScrollView
      contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Badge label={t('clause.detail')} tone="info" />
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('clause.close')}
          hitSlop={10}
          style={{
            width: layout.minTouchTarget,
            height: layout.minTouchTarget,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={22} color={theme.colors.ink} />
        </Pressable>
      </View>

      <Text variant="h2">{state.clause.title}</Text>

      {state.flag ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <RiskBadge level={state.flag.level} />
          <Text variant="small" color="muted" style={{ flex: 1 }}>
            {state.flag.title}
          </Text>
        </View>
      ) : null}

      {/* Original text */}
      <View style={{ gap: space.xs }}>
        <Text variant="label" color="muted">
          {t('clause.original')}
        </Text>
        <View
          style={{
            padding: space.md,
            borderRadius: radii.sm,
            backgroundColor: theme.colors.paper,
            borderWidth: 1,
            borderColor: theme.colors.hairline,
          }}
        >
          <Text variant="body" color="ink" style={{ fontStyle: 'italic' }}>
            “{state.clause.original}”
          </Text>
        </View>
      </View>

      {/* Plain rewrite */}
      <View style={{ gap: space.xs }}>
        <Text variant="label" color="flameDeep">
          {t('clause.plain')}
        </Text>
        <Text variant="bodyLg">{state.clause.plainRewrite}</Text>
      </View>

      {/* Risk + citation */}
      {state.flag ? (
        <View style={{ gap: space.sm }}>
          <Text variant="label" color="muted">
            {t('clause.why')}
          </Text>
          <Text variant="body">{state.flag.explanation}</Text>
          <CitedBasis citation={state.flag.citedBasis} />
        </View>
      ) : null}

      <Text variant="small" color="muted">
        ⚖︎ {t('clause.disclaimer')}
      </Text>
    </ScrollView>
  ) : null;

  return (
    <AnimatePresence>
      {open ? (
        <View
          style={{ position: 'absolute', inset: 0, zIndex: 40 }}
          // On wide layouts the panel is docked; the scrim only covers the
          // remaining area. On mobile the scrim covers everything behind the sheet.
        >
          {/* Scrim */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: reduced ? 0 : motion.fast }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={onClose}
              style={{ flex: 1, backgroundColor: theme.colors.scrim }}
            />
          </MotiView>

          {isWide ? (
            <MotiView
              from={{ translateX: reduced ? 0 : layout.docPanelWidth }}
              animate={{ translateX: 0 }}
              exit={{ translateX: reduced ? 0 : layout.docPanelWidth }}
              transition={{ type: 'timing', duration: reduced ? 0 : motion.base }}
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: layout.docPanelWidth,
                  backgroundColor: theme.colors.card,
                  borderLeftWidth: 1,
                  borderLeftColor: theme.colors.hairline,
                  paddingTop: insets.top,
                },
                webShadow('lg'),
              ]}
            >
              {Body}
            </MotiView>
          ) : (
            <MotiView
              from={{ translateY: reduced ? 0 : 600 }}
              animate={{ translateY: 0 }}
              exit={{ translateY: reduced ? 0 : 600 }}
              transition={{ type: 'timing', duration: reduced ? 0 : motion.base }}
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  maxHeight: '86%',
                  backgroundColor: theme.colors.card,
                  borderTopLeftRadius: radii.lg,
                  borderTopRightRadius: radii.lg,
                  paddingBottom: insets.bottom,
                },
                webShadow('lg'),
              ]}
            >
              {/* Grab handle */}
              <View style={{ alignItems: 'center', paddingTop: space.sm }}>
                <View
                  style={{
                    width: 44,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: theme.colors.hairline,
                  }}
                />
              </View>
              {Body}
            </MotiView>
          )}
        </View>
      ) : null}
    </AnimatePresence>
  );
}

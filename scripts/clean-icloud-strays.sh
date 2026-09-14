#!/bin/sh
# ============================================================
# Прибирає в .git те, що заважає git працювати:
#
# 1) Дублікати від iCloud/Dropbox — "HEAD 2", "index 2".
#    Служба синхронізації, побачивши конфлікт, робить копію з пробілом
#    і цифрою. Git читає папку рефів цілком і падає:
#      fatal: bad object refs/remotes/origin/HEAD 2
#
# 2) ЗАСТРЯГЛІ lock-файли — HEAD.lock, index.lock, maintenance.lock.
#    Git бачить lock і вважає, що працює інший процес: коміт висить
#    хвилинами, потім "cannot lock ref 'HEAD'".
#    Такі файли лишає будь-яке середовище, що не може видаляти в .git.
#
# ОБЕРЕЖНО: lock видаляємо лише СТАРШИЙ за 2 хвилини. Свіжий lock майже
# напевно належить git-процесу, який працює прямо зараз, — його не чіпаємо.
#
# Видаляємо "X N" лише якщо поруч лежить оригінальний "X".
# POSIX sh, без bash-ізмів.
# ============================================================
set -eu

GITDIR=$(git rev-parse --git-dir 2>/dev/null) || exit 0

# 1) дублікати синхронізації
find "$GITDIR" -type f -name "* [0-9]" -exec sh -c '
  for f do
    base=${f% [0-9]}
    if [ -e "$base" ]; then
      rm -f "$f" && echo "  прибрано дублікат iCloud: $f"
    fi
  done
' sh {} + 2>/dev/null || true

# 2) застряглі locks (старші за 2 хв)
for lk in HEAD.lock index.lock config.lock objects/maintenance.lock; do
  f="$GITDIR/$lk"
  [ -e "$f" ] || continue
  if [ -n "$(find "$f" -mmin +2 2>/dev/null)" ]; then
    rm -f "$f" && echo "  знято застряглий lock: $lk"
  fi
done

# 3) обірвані тимчасові об'єкти
find "$GITDIR/objects" -name "tmp_obj_*" -mmin +2 -delete 2>/dev/null || true

find "$GITDIR" -name ".DS_Store" -type f -delete 2>/dev/null || true
exit 0

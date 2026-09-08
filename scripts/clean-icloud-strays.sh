#!/bin/sh
# ============================================================
# Прибирає файли-дублікати, які створює iCloud/Dropbox усередині .git
#
# Служба синхронізації, побачивши конфлікт версій, робить копію з
# пробілом і цифрою в кінці назви: "HEAD 2", "index 2". Git читає папку
# рефів цілком, натикається на "HEAD 2" і падає:
#   fatal: bad object refs/remotes/origin/HEAD 2
#   error: ... did not send all necessary objects
#
# Скрипт свідомо обережний: видаляє "X N" ЛИШЕ якщо поруч лежить
# оригінальний "X". Тобто рівно дублікати, і нічого більше.
# POSIX sh, без bash-ізмів — щоб працювало і з хуків, і вручну.
# ============================================================
set -eu

GITDIR=$(git rev-parse --git-dir 2>/dev/null) || exit 0

find "$GITDIR" -type f -name "* [0-9]" -exec sh -c '
  for f do
    base=${f% [0-9]}
    if [ -e "$base" ]; then
      rm -f "$f" && echo "  прибрано дублікат iCloud: $f"
    fi
  done
' sh {} + 2>/dev/null || true

find "$GITDIR" -name ".DS_Store" -type f -delete 2>/dev/null || true

exit 0

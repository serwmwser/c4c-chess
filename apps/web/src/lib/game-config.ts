
export const wagerOptions = Array.from({ length: 20 }, (_, index) =>
  50000 + index * 50000,
);

export const timeControls = [15, 30, 60, 120] as const;
EOF

package com.cafepos.common;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/** "Today" is the shop's day in Thailand, whatever timezone the server runs in (Render/Docker use UTC). */
public final class ShopTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Bangkok");

    private ShopTime() {
    }

    public static Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(ZONE).toInstant();
    }
}

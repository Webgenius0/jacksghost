<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    public function scopeSearch(Builder $query, array $columns = [], ?string $search = null): Builder {
        if (empty($columns)) {
            return $query;
        }

        $search ??= request('search');

        return $query->when($search, function ($q) use ($search, $columns) {
            $q->where(function ($subQuery) use ($search, $columns) {
                foreach ($columns as $column) {
                    $subQuery->orWhere($column, 'like', "%{$search}%");
                }
            });
        });
    }

    public function scopePaginateData(Builder $query, int $perPage = 10) {
        return $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }
}
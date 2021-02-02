<?php

namespace App\ModelFilters;

class VideoFilter extends DefaultModelFilter
{
    protected $sortable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'created_at',
        'categories_id',
        'genres_id'
    ];

    public function search($search)
    {
        $this->where('name', 'LIKE', "%$search%");
    }
}

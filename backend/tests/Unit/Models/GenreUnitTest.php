<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class GenreUnitTest extends TestCase
{

    private $genre;

    protected function setup(): void
    {
        parent::setUp();
        $this->genre = new Genre();
    }

    public function testFillable()
    {
        $fillable = ['name', 'active'];
        $this->assertEquals($fillable, $this->genre->getFillable());
    }

    public function testDates()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->genre->getdates());
        }

        $this->assertCount(count($dates), $this->genre->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class
        ];

        $genreTraits = array_keys(class_uses(Genre::class));
        $this->assertEquals($traits, $genreTraits);
    }

    public function testCasts()
    {
        $casts = [
            'id' => 'string',
            'active' => 'boolean'
        ];
        $this->assertEquals($casts, $this->genre->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->genre->incrementing);
    }
}

<?php

namespace Tests\Unit\Models;

use App\Models\Traits\UploadFiles;
use App\Models\Video;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class VideoUnitTest extends TestCase
{

    private $video;

    protected function setup(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testFillable()
    {
        $fillable = [
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file',
            'thumb_file',
            'banner_file',
            'trailer_file'
        ];
        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testDates()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->video->getdates());
        }

        $this->assertCount(count($dates), $this->video->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class, UploadFiles::class
        ];

        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEquals($traits, $videoTraits);
    }

    public function testCasts()
    {
        $casts = [
            'id' => 'string',
            'opened' => 'boolean',
            'year_launched' => 'smallInteger',
            'duration' => 'smallInteger'
        ];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->video->incrementing);
    }
}

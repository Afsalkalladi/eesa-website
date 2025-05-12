# users/management/commands/update_semesters.py
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from users.models import Student
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Update all student semesters based on their enrollment year'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the command without making actual changes',
        )
        parser.add_argument(
            '--enrollment-year',
            type=int,
            help='Update only students from specific enrollment year',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        enrollment_year = options.get('enrollment_year')
        
        # Get students to update
        students = Student.objects.filter(is_active=True)
        if enrollment_year:
            students = students.filter(enrollment_year=enrollment_year)
            self.stdout.write(f'Filtering students from enrollment year {enrollment_year}')
        
        total_students = students.count()
        updated_count = 0
        error_count = 0
        
        self.stdout.write(f'Processing {total_students} active students...')
        
        for student in students:
            try:
                old_semester = student.current_semester
                calculated_semester = student.calculated_semester
                
                if old_semester != calculated_semester:
                    if not dry_run:
                        student.current_semester = calculated_semester
                        student.save()
                    
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'{"[DRY RUN] " if dry_run else ""}'
                            f'Updated {student.user.get_full_name()} ({student.student_id}) '
                            f'from semester {old_semester} to {calculated_semester}'
                        )
                    )
                    
                    # Log the update
                    logger.info(
                        f'{"[DRY RUN] " if dry_run else ""}'
                        f'Updated student {student.student_id} '
                        f'from semester {old_semester} to {calculated_semester}'
                    )
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'Error updating student {student.student_id}: {str(e)}'
                    )
                )
                logger.error(
                    f'Error updating student {student.student_id}: {str(e)}'
                )
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(
            self.style.SUCCESS(
                f'{"[DRY RUN] " if dry_run else ""}'
                f'Semester update completed:'
            )
        )
        self.stdout.write(f'Total students processed: {total_students}')
        self.stdout.write(f'Students updated: {updated_count}')
        self.stdout.write(f'Students unchanged: {total_students - updated_count - error_count}')
        self.stdout.write(f'Errors encountered: {error_count}')
        self.stdout.write('='*50 + '\n')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    'This was a dry run. No actual changes were made. '
                    'Run without --dry-run to apply changes.'
                )
            )